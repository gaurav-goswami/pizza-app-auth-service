import { NextFunction, Response } from "express";
import { UserService } from "../services/userService";
import { RegisterUser } from "../types";
import { Logger } from "winston";
import createHttpError from "http-errors";
import { validationResult } from "express-validator/src/validation-result";

class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {}

  async register(req: RegisterUser, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ error: result.array() });
    }

    const { firstName, lastName, email, password } = req.body;
    this.logger.debug("Register request", {
      firstName,
      lastName,
      email,
      password: "",
    });
    try {
      if (!email) {
        const err = createHttpError(400, "Email id is missing");
        next(err);
      }

      await this.userService.create({
        firstName,
        lastName,
        email,
        password,
      });

      this.logger.info("user has been registered", { userId: 1 });

      const accessToken = "akjshdkjas";
      const refreshToken = "amdsvmndasnmb";

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365,
        httpOnly: true,
      });

      res.status(201).json({ id: 1 });
    } catch (error) {
      return next(error);
    }
  }
}

export default AuthController;
