import express, { NextFunction, Request, Response } from "express";
import TenantController from "../controllers/TenantContoller";
import { ITenantRequest } from "../types";
import { TenantService } from "../services/tenantService";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entity/Tenant";
import logger from "../config/logger";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";
import tenantValidator from "../validators/tenantValidator";

const Router = express.Router();

const tenantRepo = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepo);
const tenantController = new TenantController(tenantService, logger);

Router.post(
  "/",
  authenticate,
  canAccess([Roles.ADMIN]),
  tenantValidator,
  (req: ITenantRequest, res: Response, next: NextFunction) => {
    return tenantController.create(req, res, next);
  },
);

Router.get("/", (req: Request, res: Response, next: NextFunction) => {
  return tenantController.tenantList(req, res, next);
});

Router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
  return tenantController.getTenant(req, res, next);
});

Router.patch(
  "/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  tenantValidator,
  (req: Request, res: Response, next: NextFunction) => {
    return tenantController.updateTenant(req, res, next);
  },
);

Router.delete(
  "/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response) => {
    return tenantController.deleteTenant(req, res);
  },
);

export default Router;
