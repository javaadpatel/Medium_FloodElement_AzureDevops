var appRoot = require('app-root-path');
var winston = require("winston");
const {
  format
} = require("logform");

// define the custom settings for each transport (file, console)
const logFilePath = `${appRoot}/logs/app.log`;

console.log(`Log file path: ${logFilePath}`);

var options = {
  file: {
    level: 'info',
    filename: logFilePath,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

const {
  combine,
  timestamp,
  label,
  printf
} = format;

const myFormat = printf(({
  level,
  message,
  label,
  timestamp
}) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

// instantiate a new Winston Logger with the settings defined above
var logger = new winston.createLogger({
  format: combine(
    label({
      label: 'FloodElementMonitor'
    }),
    timestamp(),
    myFormat
  ),
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console)
  ],
  exitOnError: false, // do not exit on handled exceptions
});

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write: function (message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message);
  },
};

module.exports = logger;