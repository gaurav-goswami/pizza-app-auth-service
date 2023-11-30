import { NextFunction, Request, Response } from "express";
import { ITenantRequest } from "../types";
import { TenantService } from "../services/tenantService";
import { Logger } from "winston";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";

export default class TenantController {
  constructor(
    private tenantService: TenantService,
    private logger: Logger,
  ) {}

  async create(req: ITenantRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ error: result.array() });
    }

    const { name, address } = req.body;

    this.logger.debug("Request for creating a tenant", req.body);

    try {
      const tenant = await this.tenantService.create({ name, address });

      this.logger.info("Tenant has been created", { id: tenant.id });
      res.status(201).json({ id: tenant.id });
    } catch (error) {
      return next(error);
    }
  }

  async tenantList(req: Request, res: Response, next: NextFunction) {
    this.logger.info("Request to fetch all tenants");
    try {
      const tenants = await this.tenantService.getTenants();

      this.logger.info("Tenants fetched", tenants);
      res.status(200).json(tenants);
    } catch (error) {
      return next(error);
    }
  }

  async getTenant(req: Request, res: Response, next: NextFunction) {
    this.logger.info("Request for a single tenant", {
      tenantId: req.params.id,
    });

    const { id } = req.params;
    if (isNaN(Number(id))) {
      return next(createHttpError(422, "Invalid url param"));
    }
    try {
      const tenant = await this.tenantService.getTenantById(Number(id));

      this.logger.info("Tenant fetched", tenant);
      res.status(200).json(tenant);
    } catch (error) {
      return next(error);
    }
  }

  async updateTenant(req: ITenantRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ error: result.array() });
    }

    const { name, address } = req.body;
    const { id } = req.params;
    if (isNaN(Number(id))) {
      return next(createHttpError(422, "Invalid url param"));
    }

    this.logger.info("New request to update a tenant", req.body);
    try {
      await this.tenantService.updateTenantById(Number(id), { name, address });
      res.status(204).json({ message: "Tenant updated", id });
    } catch (error) {
      return next(error);
    }
  }

  async deleteTenant(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    if (isNaN(Number(id))) {
      return next(createHttpError(422, "Invalid url param"));
    }

    this.logger.info("Request to delete a tenant", { tenantId: id });

    try {
      await this.tenantService.deleteTenantById(Number(id));

      this.logger.info("Tenant has been deleted", { tenantId: id });
      return res.json({ tenantId: id });
    } catch (error) {
      return next(error);
    }
  }
}
