/* eslint-disable @typescript-eslint/no-unused-vars */
import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import { HttpError } from "http-errors";
import logger from "./config/logger";
import cookieParser from "cookie-parser";

// routes import
import authRoute from "./routes/auth";
import tenantRoute from "./routes/tenant";
import usersRoute from "./routes/user";

const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

// use routes
app.use("/auth", authRoute);
app.use("/tenants", tenantRoute);
app.use("/users", usersRoute);

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message);
  const statusCode = err.statusCode || err.status || 500;
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
