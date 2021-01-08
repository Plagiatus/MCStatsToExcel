"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ConsoleColors;
(function (ConsoleColors) {
    function updateStringWithColor(input, color) {
        return "\x1b[" + color + "m" + input + "\x1b[0m";
    }
    ConsoleColors.updateStringWithColor = updateStringWithColor;
    function blue(input) {
        return updateStringWithColor(input, 34);
    }
    ConsoleColors.blue = blue;
    function yellow(input) {
        return updateStringWithColor(input, 33);
    }
    ConsoleColors.yellow = yellow;
    function red(input) {
        return updateStringWithColor(input, 31);
    }
    ConsoleColors.red = red;
    function cyan(input) {
        return updateStringWithColor(input, 36);
    }
    ConsoleColors.cyan = cyan;
    function green(input) {
        return updateStringWithColor(input, 32);
    }
    ConsoleColors.green = green;
    function magenta(input) {
        return updateStringWithColor(input, 35);
    }
    ConsoleColors.magenta = magenta;
    function white(input) {
        return updateStringWithColor(input, 37);
    }
    ConsoleColors.white = white;
    function black(input) {
        return updateStringWithColor(input, 30);
    }
    ConsoleColors.black = black;
    function gray(input) {
        return updateStringWithColor(input, 90);
    }
    ConsoleColors.gray = gray;
    function blueBg(input) {
        return updateStringWithColor(input, 44);
    }
    ConsoleColors.blueBg = blueBg;
    function yellowBg(input) {
        return updateStringWithColor(input, 43);
    }
    ConsoleColors.yellowBg = yellowBg;
    function redBg(input) {
        return updateStringWithColor(input, 41);
    }
    ConsoleColors.redBg = redBg;
    function cyanBg(input) {
        return updateStringWithColor(input, 46);
    }
    ConsoleColors.cyanBg = cyanBg;
    function greenBg(input) {
        return updateStringWithColor(input, 42);
    }
    ConsoleColors.greenBg = greenBg;
    function magentaBg(input) {
        return updateStringWithColor(input, 45);
    }
    ConsoleColors.magentaBg = magentaBg;
    function whiteBg(input) {
        return updateStringWithColor(input, 47);
    }
    ConsoleColors.whiteBg = whiteBg;
    function blackBg(input) {
        return updateStringWithColor(input, 40);
    }
    ConsoleColors.blackBg = blackBg;
    function grayBg(input) {
        return updateStringWithColor(input, 100);
    }
    ConsoleColors.grayBg = grayBg;
})(ConsoleColors || (ConsoleColors = {}));
exports.default = ConsoleColors;
