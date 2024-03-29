"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const excel = __importStar(require("exceljs"));
const ConsoleColors_1 = __importDefault(require("./ConsoleColors"));
// import * as prompt from "prompt";
const fs = __importStar(require("fs"));
// @ts-expect-error
const fetch = __importStar(require("node-fetch"));
const color = ConsoleColors_1.default;
let defaultOptions = { input: "./", output: "./MCStatsToExcel.xlsx", parsePlayernames: true, includeTranslation: false, swapRowsAndColumns: false };
let argumentHandlers = [];
let intervals = [];
argumentHandlers.push({
    name: "help", shortName: "h", info: "Displays this help message.", usage: "", amountArgs: 0, apply: function () {
        let table = {};
        for (let a of argumentHandlers) {
            table["--" + a.name] = { short: "-" + a.shortName, arguments: a.usage, info: a.info };
        }
        console.table(table, ["short", "arguments", "info"]);
        return false;
    }
});
argumentHandlers.push({
    name: "output", shortName: "o", info: "Sets the path and name of the output file. (default: '" + defaultOptions.output + "')", usage: "<filePath>", amountArgs: 1, apply: function (args) {
        if (args.length == 0) {
            console.log(color.red(`Error setting output file: no filename provided.`));
            return false;
        }
        let arg = args[0].trim();
        if (!arg.endsWith(".xlsx"))
            arg += ".xlsx";
        if (!arg.startsWith("./") && !arg.startsWith("../") && !arg.slice(1).startsWith("://") && !arg.startsWith("/"))
            arg = "./" + arg;
        return { output: arg };
    }
});
argumentHandlers.push({
    name: "input", shortName: "i", info: "Sets the path of the input directory. (default: '" + defaultOptions.input + "')", usage: "<filePath>", amountArgs: 1, apply: function (args) {
        if (args.length == 0) {
            console.log(color.red(`Error setting input file: no filename provided.`));
            return false;
        }
        let arg = args[0].trim();
        if (!arg.startsWith("./") && !arg.startsWith("../") && !arg.slice(1).startsWith("://") && !arg.startsWith("/"))
            arg = "./" + arg;
        return { input: arg };
    }
});
argumentHandlers.push({
    name: "summation", shortName: "s", info: "Sets the json file that declares additional summation. (default: none)", usage: "<filePath>", amountArgs: 1, apply: function (args) {
        if (args.length == 0) {
            console.log(color.red(`Error setting extra summation file: no filename provided.`));
            return false;
        }
        let arg = args[0].trim();
        if (!arg.endsWith(".json")) {
            console.log(color.red(`Error setting extra summation file: File needs to be a json file. (${arg})`));
            return false;
        }
        if (!arg.startsWith("./") && !arg.startsWith("../") && !arg.slice(1).startsWith("://") && !arg.startsWith("/"))
            arg = "./" + arg;
        return { summation: arg };
    }
});
argumentHandlers.push({
    name: "config", shortName: "c", info: "Loads the options from the given config file.", usage: "<filePath>", amountArgs: 1, apply: function (args) {
        if (args.length == 0) {
            console.log(color.red(`Error setting config file: no filename provided.`));
            return false;
        }
        let arg = args[0].trim();
        if (!arg.endsWith(".json")) {
            console.log(color.red(`Error setting config file: File needs to be a json file. (${arg})`));
            return false;
        }
        if (!arg.startsWith("./") && !arg.startsWith("../") && !arg.slice(1).startsWith("://") && !arg.startsWith("/"))
            arg = "./" + arg;
        return { configFile: arg };
    }
});
argumentHandlers.push({
    name: "uuid", shortName: "u", info: "If present, the output will use the UUID in the filename instead of quering the playernames.", usage: "", amountArgs: 0, apply: function (args) {
        return { parsePlayernames: false };
    }
});
argumentHandlers.push({
    name: "swap", shortName: "w", info: "If present, rows and columns will be swapped in the output file.", usage: "", amountArgs: 0, apply: function (args) {
        return { swapRowsAndColumns: true };
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
    console.log(color.magenta("\n==================================\nMinecraft stats to Excel convertor\n=================================="), color.magenta("\n  code by Plagiatus (https://plagiatus.net)"), color.magenta("\n  idea and funding by Xisuma (https://xisumavoid.com)"), color.blue("\n  Code and Download: https://github.com/plagiatus/MCStatsToExcel/releases"), "\n\n------");
    let noArgs = false;
    if (process.argv.length == 2) {
        console.log(color.gray("No arguments provided, using default values."));
        noArgs = true;
    }
    let interval = setInterval(() => { process.stdout.write("."); }, 500);
    intervals.push(interval);
    let options = processArgs();
    if (options) {
        try {
            let data = await loadFiles(options);
            createData(data, options);
            console.log(color.black(color.greenBg("\n\nExcel successfully exported.")));
        }
        catch (error) {
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
function processArgs() {
    let options = JSON.parse(JSON.stringify(defaultOptions));
    let args = process.argv.slice(2);
    let errored = false;
    for (let i = 0; i < args.length; i++) {
        let handler;
        for (let a of argumentHandlers) {
            if (args[i].startsWith("--")) {
                if (a.name == args[i].slice(2)) {
                    handler = a;
                    break;
                }
            }
            else if (args[i].startsWith("-")) {
                if (a.shortName == args[i].slice(1)) {
                    handler = a;
                    break;
                }
            }
        }
        if (!handler) {
            console.log(color.red("Unknown argument #" + (i + 1) + ": " + args[i] + "\nTry using only --help if you have issues with the arguments."));
            return;
        }
        let newOptions = handler.apply(args.slice(i + 1));
        if (typeof newOptions == "boolean") {
            if (!newOptions)
                return;
        }
        else {
            options = {
                ...options,
                ...newOptions
            };
        }
        i += handler.amountArgs;
    }
    if (errored)
        return;
    return options;
}
async function loadFiles(options) {
    console.log("Loading required resources");
    // Config File
    if (options.configFile) {
        process.stdout.write("\tconfig file ");
        if (!fs.existsSync(options.configFile))
            throw new Error("config file (" + options.configFile + ") does not exist.");
        if (fs.statSync(options.configFile).isDirectory())
            throw new Error("Defined config file is a directory.");
        if (!options.configFile.endsWith(".json"))
            throw new Error("Summation file is not a .json file");
        let fileContent = await fs.promises.readFile(options.configFile, "utf-8");
        let config = JSON.parse(fileContent);
        for (let opt in config) {
            //@ts-expect-error
            options[opt] = config[opt];
        }
        console.log(color.green("done"));
    }
    // Player Files Input
    process.stdout.write("\tplayer files ");
    if (!options.input)
        throw new Error("No inputs defined.");
    if (!fs.existsSync(options.input))
        throw new Error("input (" + options.input + ") does not exist.");
    if (!fs.statSync(options.input).isDirectory())
        throw new Error("Defined input is not a directory.");
    let files = await fs.promises.readdir(options.input);
    if (files.length == 0)
        throw new Error("no files in the specified input directory.");
    let inputs = [];
    for (let f of files) {
        if (!f.endsWith(".json"))
            continue;
        if (f.length != 41)
            continue;
        let uuid = f.slice(0, f.length - 5);
        if (!uuid.match(/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/))
            continue;
        let content = await fs.promises.readFile(options.input + "/" + f, "utf-8");
        let input = JSON.parse(content);
        input.playeruuid = uuid;
        inputs.push(input);
    }
    if (inputs.length == 0)
        throw new Error("no valid files found in the directory. you should not rename the files from their original filenames.");
    let loadedData = { inputs };
    console.log(color.green("done"));
    // Summation Files
    if (options.summation) {
        process.stdout.write("\tsummation file ");
        if (!fs.existsSync(options.summation))
            throw new Error("summation file (" + options.summation + ") does not exist.");
        if (fs.statSync(options.summation).isDirectory())
            throw new Error("Defined summation file is a directory.");
        if (!options.summation.endsWith(".json"))
            throw new Error("Summation file is not a .json file");
        let fileContent = await fs.promises.readFile(options.summation, "utf-8");
        let summation = JSON.parse(fileContent);
        loadedData.summation = summation;
        console.log(color.green("done"));
    }
    // UUID -> Name
    if (options.parsePlayernames) {
        process.stdout.write("\tquering playernames ");
        for (let i of loadedData.inputs) {
            try {
                let response = await fetch("https://sessionserver.mojang.com/session/minecraft/profile/" + i.playeruuid);
                let reply = await response.json();
                //@ts-expect-error
                if (reply.error || reply.length == 0)
                    throw new Error(reply.error);
                i.playername = reply.name;
            }
            catch (error) {
                console.log("\n\t\tPlayeruuid not found: ", i.playeruuid);
                i.playername = i.playeruuid;
            }
        }
        console.log(color.green("done"));
    }
    return loadedData;
}
function createData(data, options) {
    if (options.summation)
        calculateSumups(data);
    let referenceInput = getAllStats(data);
    let workbook = createExcel(data, referenceInput, options);
    saveExcel(workbook, options.output);
}
function getAllStats(data) {
    let result = { playername: "", playeruuid: "", stats: {} };
    for (let i of data.inputs) {
        for (let category in i.stats) {
            if (!result.stats[category])
                result.stats[category] = {};
            for (let stat in i.stats[category]) {
                result.stats[category][stat] = i.stats[category][stat];
            }
        }
    }
    return result;
}
function calculateSumups(data) {
    for (let sheet in data.summation) {
        for (let player of data.inputs) {
            player.stats[sheet] = {};
        }
        for (let name in data.summation[sheet]) {
            for (let player of data.inputs) {
                let total = 0;
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
function createExcel(data, refInput, options) {
    process.stdout.write("Generating Excel File ");
    let workbook = createWorkbook();
    for (let category in refInput.stats) {
        let name = category.includes(":") ? category.split(":")[1] : category;
        let sheet = workbook.addWorksheet(name);
        let firstCell = sheet.getCell(1, 1);
        firstCell.value = category;
        firstCell.font = { bold: true, size: 16 };
        sheet.getColumn(1).width = category.length * 1.5;
        let row = 1, col = 1;
        const swap = !!options.swapRowsAndColumns;
        for (let i = 0; i < data.inputs.length; i++) {
            sheet.getCell(!swap ? row : col + i + 1, !swap ? col + i + 1 : row).value = options.parsePlayernames ? data.inputs[i].playername : data.inputs[i].playeruuid;
        }
        for (let stat in refInput.stats[category]) {
            row++;
            let cell = sheet.getCell(!swap ? row : col, !swap ? col : row);
            cell.value = stat;
            if (stat.length > (sheet.getColumn(!swap ? col : row).width ?? 0)) {
                sheet.getColumn(!swap ? col : row).width = stat.length;
            }
            for (let i = 0; i < data.inputs.length; i++) {
                let cell = sheet.getCell(!swap ? row : col + i + 1, !swap ? col + i + 1 : row);
                if (data.inputs[i].stats[category] && data.inputs[i].stats[category][stat]) {
                    cell.value = data.inputs[i].stats[category][stat];
                }
                else {
                    cell.value = 0;
                }
            }
        }
    }
    console.log(color.green("done"));
    return workbook;
}
function saveExcel(workbook, path) {
    if (!path)
        throw new Error("Output path not defined.");
    workbook.xlsx.writeFile(path);
}
function createWorkbook() {
    return new excel.Workbook();
}
function clearIntervals() {
    for (let i of intervals) {
        clearInterval(i);
    }
}
async function keypress() {
    process.stdin.setRawMode(true);
    return new Promise(resolve => process.stdin.once('data', () => {
        process.stdin.setRawMode(false);
        resolve();
    }));
}
