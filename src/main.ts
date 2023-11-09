import * as excel from "exceljs";
import ConsoleColors from "./ConsoleColors";
// import * as prompt from "prompt";
import * as fs from "fs";
// @ts-expect-error
import * as fetch from "node-fetch";

const color = ConsoleColors;

interface Options {
  input?: string;
  output?: string;
  summation?: string;
  parsePlayernames?: boolean;
  includeTranslation?: boolean;
  configFile?: string;
}

let defaultOptions: Options = { input: "./", output: "./MCStatsToExcel.xlsx", parsePlayernames: true, includeTranslation: false };

interface Argument {
  name: string,
  shortName: string,
  info: string,
  usage: string,
  amountArgs: number,
  apply: (args: string[]) => Options | boolean,
}

let argumentHandlers: Argument[] = [];
let intervals: NodeJS.Timeout[] = [];

argumentHandlers.push({
  name: "help", shortName: "h", info: "Displays this help message.", usage: "", amountArgs: 0, apply: function (): boolean {
    let table: { [key: string]: { short: string, arguments: string, info: string } } = {};
    for (let a of argumentHandlers) {
      table["--" + a.name] = { short: "-" + a.shortName, arguments: a.usage, info: a.info };
    }
    console.table(table, ["short", "arguments", "info"]);
    return false;
  }
});
argumentHandlers.push({
  name: "output", shortName: "o", info: "Sets the path and name of the output file. (default: '" + defaultOptions.output + "')", usage: "<filePath>", amountArgs: 1, apply: function (args: string[]): Options | boolean {
    if (args.length == 0) {
      console.log(color.red(`Error setting output file: no filename provided.`))
      return false;
    }
    let arg: string = args[0].trim();
    if (!arg.endsWith(".xlsx")) arg += ".xlsx";
    if (!arg.startsWith("./") && !arg.startsWith("../") && !arg.slice(1).startsWith("://") && !arg.startsWith("/")) arg = "./" + arg;
    return { output: arg };
  }
});
argumentHandlers.push({
  name: "input", shortName: "i", info: "Sets the path of the input directory. (default: '" + defaultOptions.input + "')", usage: "<filePath>", amountArgs: 1, apply: function (args: string[]): Options | boolean {
    if (args.length == 0) {
      console.log(color.red(`Error setting input file: no filename provided.`))
      return false;
    }
    let arg: string = args[0].trim();
    if (!arg.startsWith("./") && !arg.startsWith("../") && !arg.slice(1).startsWith("://") && !arg.startsWith("/")) arg = "./" + arg;
    return { input: arg };
  }
});
argumentHandlers.push({
  name: "summation", shortName: "s", info: "Sets the json file that declares additional summation. (default: none)", usage: "<filePath>", amountArgs: 1, apply: function (args: string[]): Options | boolean {
    if (args.length == 0) {
      console.log(color.red(`Error setting extra summation file: no filename provided.`))
      return false;
    }
    let arg: string = args[0].trim();
    if (!arg.endsWith(".json")) {
      console.log(color.red(`Error setting extra summation file: File needs to be a json file. (${arg})`));
      return false;
    }
    if (!arg.startsWith("./") && !arg.startsWith("../") && !arg.slice(1).startsWith("://") && !arg.startsWith("/")) arg = "./" + arg;
    return { summation: arg };
  }
});
argumentHandlers.push({
  name: "config", shortName: "c", info: "Loads the options from the given config file.", usage: "<filePath>", amountArgs: 1, apply: function (args: string[]): Options | boolean {
    if (args.length == 0) {
      console.log(color.red(`Error setting config file: no filename provided.`))
      return false;
    }
    let arg: string = args[0].trim();
    if (!arg.endsWith(".json")) {
      console.log(color.red(`Error setting config file: File needs to be a json file. (${arg})`));
      return false;
    }
    if (!arg.startsWith("./") && !arg.startsWith("../") && !arg.slice(1).startsWith("://") && !arg.startsWith("/")) arg = "./" + arg;
    return { configFile: arg };
  }
});
argumentHandlers.push({
  name: "uuid", shortName: "u", info: "If present, the output will use the UUID in the filename instead of quering the playernames", usage: "", amountArgs: 0, apply: function (args: string[]): Options | boolean {
    return { parsePlayernames: false };
  }
});
// argumentHandlers.push({
//   name: "language", shortName: "l", info: "If present, the output will include the english language names of the statistics. Requires a present minecraft installation.", usage: "", amountArgs: 0, apply: function (args: string[]): Options | boolean {
//     return { includeTranslation: true };
//   }
// });

argumentHandlers.sort((a, b) => a.name.localeCompare(b.name));


run();
async function run() {
  console.log(color.magenta("\n==================================\nMinecraft stats to Excel convertor\n=================================="),
    color.magenta("\n  code by Plagiatus (https://plagiatus.net)"),
    color.magenta("\n  idea and funding by Xisuma (https://xisumavoid.com)"),
    color.blue("\n  Code and Download: https://github.com/plagiatus/MCStatsToExcel/releases"),
    "\n\n------"
  );


  let noArgs: boolean = false;
  if (process.argv.length == 2) {
    console.log(color.gray("No arguments provided, using default values."));
    noArgs = true;
  }

  let interval: NodeJS.Timeout = setInterval(() => { process.stdout.write(".") }, 500);
  intervals.push(interval);

  let options: Options | undefined = processArgs();
  if (options) {
    try {
      let data = await loadFiles(options);
      createData(data, options);
      console.log(color.black(color.greenBg("\n\nExcel successfully exported.")));
    } catch (error: any) {
      console.log("");
      console.log(color.red("Error: " + error.message));
    }
  }
  clearIntervals();
  if (noArgs) {
    console.log("press any key to close...");
    await keypress();
    process.exit(0);
  }
}

function processArgs(): Options | undefined {
  let options: Options = JSON.parse(JSON.stringify(defaultOptions));
  let args = process.argv.slice(2);
  let errored: boolean = false;

  for (let i: number = 0; i < args.length; i++) {
    let handler: Argument | undefined;
    for (let a of argumentHandlers) {
      if (args[i].startsWith("--")) {
        if (a.name == args[i].slice(2)) {
          handler = a;
          break;
        }
      } else if (args[i].startsWith("-")) {
        if (a.shortName == args[i].slice(1)) {
          handler = a;
          break;
        }
      }
    }
    if (!handler) {
      console.log(color.red("Unknown argument #" + (i + 1) + ": " + args[i] + "\nTry using only --help if you have issues with the arguments."))
      return;
    }
    let newOptions: Options | boolean = handler.apply(args.slice(i + 1));
    if (typeof newOptions == "boolean") {
      if (!newOptions) return;
    } else {
      options = {
        ...options,
        ...newOptions
      }
    }
    i += handler.amountArgs;
  }
  if (errored) return;
  return options;
}

async function loadFiles(options: Options): Promise<LoadedData> {
  console.log("Loading required resources");

  // Config File
  if (options.configFile) {
    process.stdout.write("\tconfig file ");

    if (!fs.existsSync(options.configFile)) throw new Error("config file (" + options.configFile + ") does not exist.");
    if (fs.statSync(options.configFile).isDirectory()) throw new Error("Defined config file is a directory.");
    if (!options.configFile.endsWith(".json")) throw new Error("Summation file is not a .json file");
    let fileContent: string = await fs.promises.readFile(options.configFile, "utf-8");
    let config: Options = JSON.parse(fileContent);
    for (let opt in config) {
      //@ts-expect-error
      options[opt] = config[opt];
    }
    console.log(color.green("done"));
  }

  // Player Files Input
  process.stdout.write("\tplayer files ");
  if (!options.input) throw new Error("No inputs defined.");
  if (!fs.existsSync(options.input)) throw new Error("input (" + options.input + ") does not exist.");
  if (!fs.statSync(options.input).isDirectory()) throw new Error("Defined input is not a directory.");
  let files: string[] = await fs.promises.readdir(options.input);
  if (files.length == 0) throw new Error("no files in the specified input directory.");
  let inputs: Input[] = [];
  for (let f of files) {
    if (!f.endsWith(".json")) continue;
    if (f.length != 41) continue;
    let uuid: string = f.slice(0, f.length - 5);
    if (!uuid.match(/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/)) continue;
    let content: string = await fs.promises.readFile(options.input + "/" + f, "utf-8");
    let input: Input = JSON.parse(content);
    input.playeruuid = uuid;
    inputs.push(input);
  }
  if (inputs.length == 0) throw new Error("no valid files found in the directory. you should not rename the files from their original filenames.");
  let loadedData: LoadedData = { inputs };
  console.log(color.green("done"));

  // Summation Files
  if (options.summation) {
    process.stdout.write("\tsummation file ");
    if (!fs.existsSync(options.summation)) throw new Error("summation file (" + options.summation + ") does not exist.");
    if (fs.statSync(options.summation).isDirectory()) throw new Error("Defined summation file is a directory.");
    if (!options.summation.endsWith(".json")) throw new Error("Summation file is not a .json file");
    let fileContent: string = await fs.promises.readFile(options.summation, "utf-8");
    let summation: Summation = JSON.parse(fileContent);
    loadedData.summation = summation;
    console.log(color.green("done"));
  }

  // UUID -> Name
  if (options.parsePlayernames) {
    process.stdout.write("\tquering playernames ");
    for (let i of loadedData.inputs) {
      try {
        let response = await fetch("https://sessionserver.mojang.com/session/minecraft/profile/" + i.playeruuid);
        let reply: { name: string } = await response.json();
        //@ts-expect-error
        if (reply.error || reply.length == 0) throw new Error(reply.error);
        i.playername = reply.name;
      } catch (error) {
        console.log("\n\t\tPlayeruuid not found: ", i.playeruuid);
        i.playername = i.playeruuid;
      }
    }
    console.log(color.green("done"));
  }
  return loadedData;
}

function createData(data: LoadedData, options: Options) {
  if (options.summation) calculateSumups(data);
  let referenceInput: Input = getAllStats(data);
  let workbook: excel.Workbook = createExcel(data, referenceInput, options);
  saveExcel(workbook, options.output);
}

function getAllStats(data: LoadedData): Input {
  let result: Input = { playername: "", playeruuid: "", stats: {} };
  for (let i of data.inputs) {
    for (let category in i.stats) {
      if (!result.stats[category])
        result.stats[category] = {}
      for (let stat in i.stats[category]) {
        result.stats[category][stat] = i.stats[category][stat];
      }
    }
  }
  return result;
}

function calculateSumups(data: LoadedData) {
  for (let sheet in data.summation) {
    for (let player of data.inputs) {
      player.stats[sheet] = {};
    }
    for (let name in data.summation[sheet]) {
      for (let player of data.inputs) {
        let total: number = 0;

        for (let category in data.summation[sheet][name]) {
          for (let stat of data.summation[sheet][name][category]) {
            if (player.stats[category] && player.stats[category][stat]) {
              total += player.stats[category][stat];
            }
          }
        }

        player.stats[sheet][name] = total;
      }
    }
  }
}

function createExcel(data: LoadedData, refInput: Input, options: Options): excel.Workbook {
  process.stdout.write("Generating Excel File ");
  let workbook: excel.Workbook = createWorkbook();
  for (let category in refInput.stats) {
    let name: string = category.includes(":") ? category.split(":")[1] : category;
    let sheet: excel.Worksheet = workbook.addWorksheet(name);
    let firstCell: excel.Cell = sheet.getCell(1, 1);
    firstCell.value = category;
    firstCell.font = { bold: true, size: 16 };

    let rowNumber: number = 1;
    let firstRow: excel.Row = sheet.getRow(rowNumber);
    for (let i: number = 0; i < data.inputs.length; i++) {
      firstRow.getCell(i + 2).value = options.parsePlayernames ? data.inputs[i].playername : data.inputs[i].playeruuid;
    }

    let columnWidth: number = category.length * 1.4;
    for (let stat in refInput.stats[category]) {
      rowNumber++;
      let row: excel.Row = sheet.getRow(rowNumber);
      row.getCell(1).value = stat;
      for (let i: number = 0; i < data.inputs.length; i++) {
        if (data.inputs[i].stats[category] && data.inputs[i].stats[category][stat]) {
          row.getCell(i + 2).value = data.inputs[i].stats[category][stat];
        } else {
          row.getCell(i + 2).value = 0;
        }
      }

      if (stat.length > columnWidth) columnWidth = stat.length;
    }
    sheet.getColumn(1).width = columnWidth + 1;
  }
  console.log(color.green("done"));
  return workbook;
}

function saveExcel(workbook: excel.Workbook, path: string | undefined) {
  if (!path) throw new Error("Output path not defined.")
  workbook.xlsx.writeFile(path);
}

function createWorkbook(): excel.Workbook {
  return new excel.Workbook();
}

function clearIntervals() {
  for (let i of intervals) {
    clearInterval(i);
  }
}

async function keypress(): Promise<void> {
  process.stdin.setRawMode(true)
  return new Promise<void>(resolve => process.stdin.once('data', () => {
    process.stdin.setRawMode(false)
    resolve()
  }));
}


interface LoadedData {
  inputs: Input[],
  summation?: Summation

}

interface Summation {
  [sheetName: string]: {
    [rowTitle: string]: {
      [category: string]: string[]
    }
  }
}

interface Input {
  stats: {
    [category: string]: {
      [stat: string]: number
    }
  }
  playeruuid: string,
  playername: string,
}