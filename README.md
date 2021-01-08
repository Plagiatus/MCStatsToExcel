# MCStatsToExcel
Converts Minecraft stats into an Excel file for further usage.

[![](https://img.shields.io/github/v/release/plagiatus/MCStatsToExcel?style=flat-square)](https://github.com/plagiatus/MCStatsToExcel/releases/latest)


## What it does

This commandline tool converts an arbitrary amount of player stat files into a organised Excel file.

![](https://i.imgur.com/n7BFqHm.png)

Additionally it lets you calculate custom sums out of whatever stats you want to combine. See [how to use](#how-to-use) for further information.

## How to use

### Installation

Head over to the [releases](https://github.com/plagiatus/MCStatsToExcel/releases/latest), download it and put it somewhere. By default the program will look in the folder it is placed in for stat files, so to make it easier for yourself you can just place the executable file into the folder that the stat files are in (by default they are located in the `world/stats` folder). From there you can just doubleclick the executeable and the Excel file should appear in the same folder. If you want special summations or change other settings, read on.

#### Build yourself

_Requires node and npm to be installed._  
Alternatively to a release build you can also clone the repository to your own computer and run it through the terminal. After downloading you need to run `npm i` in the root folder of the project to install the required node modules. Then you can run the project with `node ./src/main.js` or `npm run start`. There are also two examples available, `npm run example` and `npm run exampleArg`. See the [package.json](./package.json) file for its commands.

### Usage
If you just want to convert the files into an Excel file, you can follow the description in [installation](#Installation) and just doubleclick the file to execute it. For everything else, you'll have to run the program from the commandline/shell/terminal.

If you don't know how to do that, google will surely give you an answer.

#### Arguments
The program accepts the following arguments

|argument|short|usage|info|
|-|-|-|-|
|--help|-h||Shows information about the arguments in the commandline|
|--input|-i|-i &lt;filepath&gt;|Sets the path of the input directory. (default: "./")|
|--output|-o|-o &lt;filepath&gt;|Sets the path and name of the output file. (default: "./MCStatsToExcel.xlsx")|
|--summation|-s|-s &lt;filepath&gt;|Sets the json file that declares additional summation. (default: none)|
|--uuid|-u||If present, the output will use the UUID in the filename instead of quering the playernames.|
|--config|-c|-c &lt;filepath&gt;|Loads the options from the given config file.

### Config file
The config file is a json file and it accepts the following options (basically the same as the commandline arguments):

|option|type|explanation|restrictions|default|
|-|-|-|-|-|
|input|string| The path of the input directory, relative to the executable|needs to be an existing folder|./|
|output|string|The path and filename of the output Excel, relative to the executable.|.xlsx ending, needs writing permissions for the location|./MCStatsToExcel.xlsx|
|summation|string|The path of the additional summations file, relative to the executable.|.json file|_none_|
|parsePlayernames|bool|If true, the Excel will contain the playernames instead of the UUIDs.|needs internet access|true|

**The config file is loaded after the commandline arguments, so they will be overwritten if they describe the same thing.**

[-> Example `config.json` from this project](./example/config.json)

### Summation file

In the summation file you can specify special summing ups that you might want to do of different stats.  
The format of the file needs to be as follows:

```json
{
  "NameOfTheSheet": {
    "TitleOfTheSummation": {
      "MinecraftCategory":[
        "MinecraftStat1"
      ]
    }
  }
}
```
`NameOfTheSheet` defines the name the Excel sheet should have. Needs to be unique, can contain spaces, is an object.  
`TitleOfTheSummation` defines the text displayed in the first row(s) of the sheet. Needs to be unique, can contain spaces, is an object.  
`MinecraftCategory` is the minecraft category (see [https://minecraft.gamepedia.com/Statistics](https://minecraft.gamepedia.com/Statistics)) from which to sum up the individual stats. Needs to be namespaced and all lowercase (e.g. `minecraft:block_mined`), is an array.  
`MinecraftStatX` is the stat of that category that you want to sum up. Needs to be a (for this category) valid, namespaced, all lowercase minecraft identifier (e.g. `minecraft:stone`).

If you add an invalid identifier for the last two, it will just be quietly ignored.

You can have multiple of everything.

[-> Example `summation.json` from this project](./example/summationExample.json)


> TS definition:
```ts
[sheetName: string]: {
  [rowTitle: string]: {
    [category: string]: string[]
  }
}
```


### Further Information
This works in both singleplayer and multiplayer.

## Issues
If you run into issues or bugs or have ideas for improvements, please [write an issue](https://github.com/plagiatus/MCStatsToExecl/issues).

## Ideas for future releases

- use the translation value instead of the raw minecraft id, maybe with selectable language code
- offer a guided walkthrough for less experienced users
- support wildcards for summations
- make summation more robust against 
- add options for excel formatting
- provide feedback on invalid summation options

## Contributors
<table>
<tr>
<td style="text-align:center">
<a href="https://plagiatus.net">
<img src="https://avatars1.githubusercontent.com/u/7681159?v=4" width="100px;" alt="Plagiatus"/>
</a><br>
<a href="https://plagiatus.net">Plagiatus</a><br>
Code
</td>
<td style="text-align:center">
<a href="https://xisumavoid.com">
<img src="https://xisumavoid.com/img/logo.png" width="100px;" alt="Xisuma"/>
</a><br>
<a href="https://xisumavoid.com">Xisuma</a><br>
Idea & Funding
</td>
</tr>
</table>