import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/userService";
import {
  CreateUserRequest,
  IUserQueryParams,
  UpdateUserRequest,
} from "../types";
import { matchedData, validationResult } from "express-validator";
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
    const { firstName, lastName, email, password, tenantId, role } = req.body;

    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId,
      });
      this.logger.info("Manager created", { id: user.id });
      res.status(201).json({ id: user.id });
    } catch (error) {
      return next(error);
    }
  }

  async usersList(req: Request, res: Response, next: NextFunction) {
    this.logger.info("Request to get users list");

    const validatedQuery = matchedData(req, { onlyValidData: true });
    try {
      const [users, count] = await this.userService.getAllUsers(
        validatedQuery as IUserQueryParams,
      );
      this.logger.info("All users have been fetched");

      return res.json({
        currentPage: validatedQuery.currentPage as number,
        perPage: validatedQuery.perPage as number,
        total: count,
        data: users,
      });
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

  async updateUser(req: UpdateUserRequest, res: Response, next: NextFunction) {
    this.logger.info("New request to update a user");

    const { id } = req.params;
    if (isNaN(Number(id))) {
      return next(createHttpError(422, "Invalid url parameter"));
    }

    const { firstName, lastName, role } = req.body;

    try {
      await this.userService.update(Number(id), {
        firstName,
        lastName,
        role,
      });

      this.logger.info("User updated successfully", { id });
      res.status(200).json({ id: Number(id) });
    } catch (error) {
      return next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    if (isNaN(Number(id))) {
      return next(createHttpError(422, "Invalid url param"));
    }
    this.logger.info("New request to delete a user", { userId: id });
    try {
      await this.userService.deleteById(Number(id));
      this.logger.info("User deleted successfully", { userId: id });
      res.json({ userId: id });
    } catch (error) {
      return next(error);
    }
  }
}
