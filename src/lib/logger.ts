import { LoggerOptions, pino } from "pino";

export const createLogger = (option?: LoggerOptions) =>
  pino({
    ...option,
    transport: {
      target: "pino-pretty",
      options: {
        singleLine: true,
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    },
    level: process.env.LOG_LEVEL || "info",
  });

export const logger = createLogger();
