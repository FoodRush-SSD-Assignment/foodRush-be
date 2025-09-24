const { createLogger, format, transports } = require("winston");
require("winston-daily-rotate-file");

const rotateTransport = new transports.DailyRotateFile({
  filename: "logs/security-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: "14d",
  zippedArchive: true,
  level: "info",
});

const logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.Console({ level: "debug" }), // dev
    rotateTransport,
  ],
  exceptionHandlers: [new transports.File({ filename: "logs/exceptions.log" })],
});

module.exports = logger;
