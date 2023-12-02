import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/userService";
import { CreateUserRequest } from "../types";
import { Roles } from "../constants";
import { validationResult } from "express-validator";

export default class UserController {
  constructor(private userService: UserService) {}

  async createUser(req: CreateUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ error: result.array() });
    }

    const { firstName, lastName, email, password } = req.body;

    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role: Roles.MANAGER,
      });
      res.status(201).json({ id: user.id });
    } catch (error) {
      return next(error);
    }
  }

  usersList(req: Request, res: Response) {
    res.json({});
  }
}
