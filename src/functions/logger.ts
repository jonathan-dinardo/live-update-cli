var colors = require('colors');
export function logError(msg: string) {
   console.log(colors.red(msg));
}
export function logFatal(msg: string) {
   console.log(colors.bgRed(msg));
}
export function logInfo(msg: string) {
   console.log(colors.green(msg));
}
