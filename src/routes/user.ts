import express, { Response, Request, NextFunction } from "express";
import UserController from "../controllers/UserController";
import { UserService } from "../services/userService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";

const Router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

Router.post("/", (req: Request, res: Response, next: NextFunction) => {
  return userController.createUser(req, res, next);
});

export default Router;
