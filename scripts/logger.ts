import pino from "pino";

export const logger = pino({
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
