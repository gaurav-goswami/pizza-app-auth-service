import { NextFunction, Request, Response } from "express";
import { ITenantRequest } from "../types";
import { TenantService } from "../services/tenantService";
import { Logger } from "winston";

export default class TenantController {
  constructor(
    private tenantService: TenantService,
    private logger: Logger,
  ) {}

  async create(req: ITenantRequest, res: Response, next: NextFunction) {
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
      this.logger.info("Tenants list", tenants);
      res.status(200).json(tenants);
    } catch (error) {
      return next(error);
    }
  }
}
