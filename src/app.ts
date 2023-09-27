/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { Request, Response, NextFunction } from "express";
import createError, { HttpError } from "http-errors";
import logger from "./config/logger";
const app = express();

// dummy route

app.get("/", (req, res, next) => {
  // const error = createError(401, "Unauthorized");
  // return next(error);
  return res.status(201).send("This is Auth-Service route");
});

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
