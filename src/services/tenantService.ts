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

  async getTenantById(tenantId: number) {
    try {
      return await this.tenantRepository.findOne({ where: { id: tenantId } });
    } catch (err) {
      const error = createHttpError(
        404,
        `Tenant with ID ${tenantId} not found`,
      );
      throw error;
    }
  }

  async updateTenantById(tenantId: number, tenantData: ITenantData) {
    try {
      return await this.tenantRepository.update(tenantId, tenantData);
    } catch (err) {
      const error = createHttpError(404, "Tenant not found");
      throw error;
    }
  }

  async deleteTenantById(tenantId: number) {
    return await this.tenantRepository.delete(tenantId);
  }
}
