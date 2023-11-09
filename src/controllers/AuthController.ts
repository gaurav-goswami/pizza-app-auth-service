import { NextFunction, Response } from "express";
import { UserService } from "../services/userService";
import { RegisterUser } from "../types";
import { Logger } from "winston";

class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {}

  async register(req: RegisterUser, res: Response, next: NextFunction) {
    const { firstName, lastName, email, password } = req.body;
    this.logger.debug("Register request", {
      firstName,
      lastName,
      email,
      password: "",
    });
    try {
      await this.userService.create({
        firstName,
        lastName,
        email,
        password,
      });

      this.logger.info("user has been registered", { userId: 1 });
      res.status(201).json({ id: 1 });
    } catch (error) {
      return next(error);
    }
  }
}

export default AuthController;
