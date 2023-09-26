import express, { Request, Response, NextFunction } from "express";
import createError, { HttpError } from "http-errors";
import logger from "./config/logger";
const app = express();

// dummy route
app.get("/", (req, res, next) => {
  const error = createError(401, "Unauthorized");
  return next(error);
  // res.send("This is Auth-Service route");
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
