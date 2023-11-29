import request from "supertest";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";

describe("PATCH /tenant/id", () => {
  let jwks: ReturnType<typeof createJWKSMock>;
  let connection: DataSource;
  let adminToken: string;

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

  test("should return 204 status code", async () => {
    const updatedData = {
      name: "Tenant name (new)",
      address: "Tenant address (new)",
    };

    const response = await request(app)
      .patch("/tenants/1")
      .set("Cookie", [`accessToken=${adminToken}`])
      .send(updatedData);

    expect(response.status).toBe(204);
  });

  test("should updated the tenant in the database", async () => {
    const tenantData = {
      name: "Tenant Name",
      address: "Tenant address",
    };

    const updatedData = {
      name: "Tenant name (new)",
      address: "Tenant address (new)",
    };

    const tenantRepo = connection.getRepository(Tenant);
    await tenantRepo.save(tenantData);

    await request(app)
      .patch("/tenants/1")
      .set("Cookie", [`accessToken=${adminToken}`])
      .send(updatedData);

    const tenants = await tenantRepo.find();
    expect(tenants[0].name).toBe(updatedData.name);
    expect(tenants[0].address).toBe(updatedData.address);
  });
});
