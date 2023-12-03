import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/userService";
import { CreateUserRequest } from "../types";
import { Roles } from "../constants";
import { validationResult } from "express-validator";
import { Logger } from "winston";
import createHttpError from "http-errors";

export default class UserController {
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {}

  async createUser(req: CreateUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ error: result.array() });
    }

    this.logger.info("New request to create a manager", { email: req.body });
    const { firstName, lastName, email, password } = req.body;

    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role: Roles.MANAGER,
      });
      this.logger.info("Manager created", { id: user.id });
      res.status(201).json({ id: user.id });
    } catch (error) {
      return next(error);
    }
  }

  async usersList(req: Request, res: Response, next: NextFunction) {
    this.logger.info("Request to get managers list");

    try {
      const users = await this.userService.getAllUsers();
      this.logger.info("All users have been fetched");

      res.json(users);
    } catch (error) {
      return next(error);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction) {
    this.logger.info("Request to get a user", { id: req.params });

    const { id } = req.params;
    if (isNaN(Number(id))) {
      return next(createHttpError(422, "Invalid url param"));
    }

    try {
      const user = await this.userService.userById(Number(id));

      if (!user) {
        return next(createHttpError(400, "User does not exist"));
      }

      this.logger.info("User fetched");
      res.json(user);
    } catch (error) {
      return next(error);
    }
  }
}
