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
      filename: "error.logs",
      level: "error",
      silent: Config.NODE_ENV === "true",
    }),
    new winston.transports.File({
      dirname: "logs",
      filename: "app.log",
      level: "info",
      silent: false,
    }),
  ],
});

export default logger;
