import { Repository } from "typeorm";
import { Tenant } from "../entity/Tenant";
import { ITenantData } from "../types";
import createHttpError from "http-errors";

export class TenantService {
  constructor(private tenantRepository: Repository<Tenant>) {}

  async create({ name, address }: ITenantData) {
    try {
      return await this.tenantRepository.save({ name, address });
    } catch (err) {
      const error = createHttpError(500, "Failed to store data in database");
      throw error;
    }
  }

  async getTenants() {
    try {
      return await this.tenantRepository.find();
    } catch (err) {
      const error = createHttpError(404, "Tenants not found");
      throw error;
    }
  }
}
