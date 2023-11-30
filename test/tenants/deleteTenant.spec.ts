import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import createJWKSMock from "mock-jwks";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";
import { Tenant } from "../../src/entity/Tenant";

describe("DELETE /tenants/id", () => {
  let adminToken: string;
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
    jwks = createJWKSMock("http://localhost:5501");
  });

  beforeEach(async () => {
    jwks.start();
    await connection.dropDatabase();
    await connection.synchronize();
    adminToken = jwks.token({
      sub: "1",
      role: Roles.ADMIN,
    });
  });

  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  test("should return 200 status", async () => {
    const response = await request(app)
      .delete("/tenants/1")
      .set("Cookie", [`accessToken=${adminToken}`]);
    expect(response.status).toBe(200);
  });

  test("should delete the tenant from database", async () => {
    const tenantData = {
      name: "Tenant name",
      address: "Tenant address",
    };

    const tenantRepo = connection.getRepository(Tenant);
    await tenantRepo.save(tenantData);
    await request(app)
      .delete("/tenants/1")
      .set("Cookie", [`accessToken=${adminToken}`]);

    const tenants = await tenantRepo.find();
    expect(tenants).toHaveLength(0);
  });
});
