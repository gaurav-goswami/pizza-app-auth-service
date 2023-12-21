import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
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
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  tenantValidator,
  (req: ITenantRequest, res: Response, next: NextFunction) => {
    return tenantController.create(req, res, next) as unknown as RequestHandler;
  },
);

Router.get("/", (req: Request, res: Response, next: NextFunction) => {
  return tenantController.tenantList(
    req,
    res,
    next,
  ) as unknown as RequestHandler;
});

Router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
  return tenantController.getTenant(
    req,
    res,
    next,
  ) as unknown as RequestHandler;
});

Router.patch(
  "/:id",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  tenantValidator,
  (req: Request, res: Response, next: NextFunction) => {
    return tenantController.updateTenant(
      req,
      res,
      next,
    ) as unknown as RequestHandler;
  },
);

Router.delete(
  "/:id",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) => {
    return tenantController.deleteTenant(
      req,
      res,
      next,
    ) as unknown as RequestHandler;
  },
);

export default Router;
