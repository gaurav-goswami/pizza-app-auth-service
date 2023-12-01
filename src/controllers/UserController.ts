import { Request, Response } from "express";

export default class UserController {
  createUser(req: Request, res: Response) {
    res.status(201).json({});
  }
}
