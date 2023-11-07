/* eslint-disable @typescript-eslint/no-unused-vars */
import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import createError, { HttpError } from "http-errors";
import logger from "./config/logger";

// routes import
import authRoute from "./routes/auth";

const app = express();

app.get("/", (req, res, next) => {
  logger.info("connected");
  return res.status(201).send("This is Auth-Service route");
});

// use routes
app.use("/auth", authRoute);

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode;
  logger.error(err.message);
  res.status(statusCode).json({
    errors: [
      {
        type: err.name,
        message: err.message,
        path: "",
        location: "",
      },
    ],
  });
});
export default app;
