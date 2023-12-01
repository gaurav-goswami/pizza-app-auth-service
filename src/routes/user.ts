import express, { Response, Request } from "express";
import UserController from "../controllers/UserController";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";

const Router = express.Router();

const userController = new UserController();

Router.post(
  "/",
  authenticate,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response) => {
    return userController.createUser(req, res);
  },
);

export default Router;
