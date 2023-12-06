import express, { Response, Request, NextFunction } from "express";
import UserController from "../controllers/UserController";
import { UserService } from "../services/userService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";
import createUserValidator from "../validators/create-user-validator";
import logger from "../config/logger";

const Router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService, logger);

Router.post(
  "/",
  authenticate,
  canAccess([Roles.ADMIN]),
  createUserValidator,
  (req: Request, res: Response, next: NextFunction) => {
    return userController.createUser(req, res, next);
  },
);

Router.get("/", (req: Request, res: Response, next: NextFunction) => {
  return userController.usersList(req, res, next);
});

Router.get(
  "/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) => {
    return userController.getUser(req, res, next);
  },
);

Router.patch(
  "/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) => {
    return userController.updateUser(req, res, next);
  },
);

Router.delete(
  "/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) => {
    return userController.deleteUser(req, res, next);
  },
);

export default Router;
