const winston = require("winston")
require("winston-daily-rotate-file")
const APP_NAME = "parental-control"
const LOG_DIR = "/home/pi/Documents/parentalcontrol/logs"
const LOG_LEVEL_CONSOLE = "error"
const LOG_LEVEL_FILE = "info"
/*****************************************************************/
/*******************           Logger           ***************/
/*****************************************************************/
var transportFile = new winston.transports.DailyRotateFile({
  dirname: LOG_DIR,
  filename: `${APP_NAME}-%DATE%.log`,
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "10m",
  maxFiles: "14d",
  zippedArchive: true,
  level: LOG_LEVEL_FILE,
  format: winston.format.combine(
    winston.format.timestamp(),
    // winston.format.json()
    winston.format.simple()
  ),
});
var transportConsole = new winston.transports.Console({
  level: LOG_LEVEL_CONSOLE,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
    winston.format.timestamp()
  ),
});
var logger = winston.createLogger({
  transports: [transportConsole, transportFile],
});
// Samples
// logger.log('debug', "127.0.0.1 - there's no place like home");
// logger.log('verbose', "127.0.0.1 - there's no place like home");
// logger.log('info', "127.0.0.1 - there's no place like home");
// logger.log('warn', "127.0.0.1 - there's no place like home");
// logger.log('error', "127.0.0.1 - there's no place like home");
// logger.info("127.0.0.1 - there's no place like home");
// logger.warn("127.0.0.1 - there's no place like home");
// logger.error("127.0.0.1 - there's no place like home");

module.exports = {
  logger
}