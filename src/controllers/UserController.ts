import { NextFunction, Response } from "express";
import { UserService } from "../services/userService";
import { CreateUserRequest } from "../types";

export default class UserController {
  constructor(private userService: UserService) {}

  async createUser(req: CreateUserRequest, res: Response, next: NextFunction) {
    const { firstName, lastName, email, password } = req.body;

    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
      });
      res.status(201).json({ id: user.id });
    } catch (error) {
      return next(error);
    }
  }
}
