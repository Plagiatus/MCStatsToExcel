module ConsoleColors {
  export function updateStringWithColor(input:string, color: number): string {
    return "\x1b[" + color + "m" + input + "\x1b[0m";
  }

  export function blue(input: string): string {
    return updateStringWithColor(input, 34)
  }
  export function yellow(input: string): string {
    return updateStringWithColor(input, 33)
  }
  export function red(input: string): string {
    return updateStringWithColor(input, 31)
  }
  export function cyan(input: string): string {
    return updateStringWithColor(input, 36)
  }
  export function green(input: string): string {
    return updateStringWithColor(input, 32)
  }
  export function magenta(input: string): string {
    return updateStringWithColor(input, 35)
  }
  export function white(input: string): string {
    return updateStringWithColor(input, 37)
  }
  export function black(input: string): string {
    return updateStringWithColor(input, 30)
  }
  export function gray(input: string): string {
    return updateStringWithColor(input, 90)
  }

  export function blueBg(input: string): string {
    return updateStringWithColor(input, 44)
  }
  export function yellowBg(input: string): string {
    return updateStringWithColor(input, 43)
  }
  export function redBg(input: string): string {
    return updateStringWithColor(input, 41)
  }
  export function cyanBg(input: string): string {
    return updateStringWithColor(input, 46)
  }
  export function greenBg(input: string): string {
    return updateStringWithColor(input, 42)
  }
  export function magentaBg(input: string): string {
    return updateStringWithColor(input, 45)
  }
  export function whiteBg(input: string): string {
    return updateStringWithColor(input, 47)
  }
  export function blackBg(input: string): string {
    return updateStringWithColor(input, 40)
  }
  export function grayBg(input: string): string {
    return updateStringWithColor(input, 100)
  }
}

export default ConsoleColors