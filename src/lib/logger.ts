// Winston file logger with clean output and write to file

import { createLogger, format, transports } from "winston";

const safeStrify = (data: any, pretty?: boolean) => {
  try {
    return pretty ? JSON.stringify(data, null, 2)  : JSON.stringify(data);  
  } catch (error) {
    return data; 
  }
}

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    // Format the metadata object
    format.metadata({ fillExcept: ["message", "level", "timestamp", "label"] }),
    format.printf(info => {
      const { timestamp, level, ...args } = info;
      return `[${level}]: ${safeStrify(args, true)}`;
    })
  ),
  transports: [
    new transports.File({
      filename: "logs/flow.log",
      maxFiles: 1,
      maxsize:  1024 * 1024 * 10, // 1MB
    }),
  ],
  exitOnError: false,
});

export default logger;
