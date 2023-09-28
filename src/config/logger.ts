import winston from "winston";
import { Config } from "../config/index";
const logger = winston.createLogger({
  level: "info",
  defaultMeta: {
    serviceName: "Auth-Service",
  },
  transports: [
    new winston.transports.File({
      dirname: "logs",
      filename: "error.log",
      level: "error",
      silent: Config.NODE_ENV === "true",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      dirname: "logs",
      filename: "app.log",
      level: "info",
      silent: false,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});

export default logger;
