import express, { NextFunction, Response } from "express";
import TenantController from "../controllers/TenantContoller";
import { ITenantRequest } from "../types";
import { TenantService } from "../services/tenantService";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entity/Tenant";
import logger from "../config/logger";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";

const Router = express.Router();

const tenantRepo = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepo);
const tenantController = new TenantController(tenantService, logger);

Router.post(
  "/",
  authenticate,
  canAccess([Roles.ADMIN]),
  (req: ITenantRequest, res: Response, next: NextFunction) => {
    return tenantController.create(req, res, next);
  },
);

export default Router;
