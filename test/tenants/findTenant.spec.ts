import createJWKSMock from "mock-jwks";
import request from "supertest";
import { Roles } from "../../src/constants";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { DataSource } from "typeorm";
import { Tenant } from "../../src/entity/Tenant";

describe("GET /tenants/ID", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
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

  describe("Given ID", () => {
    test("should return 200 status code", async () => {
      const response = await request(app)
        .get("/tenants/1")
        .set("Cookie", [`accessToken=${adminToken}`]);

      expect(response.status).toBe(200);
    });

    test("should return tenant with same ID", async () => {
      const id = 1;
      const tenantData = {
        name: "Tenant Name",
        address: "Tenant address",
      };

      const tenantRepo = connection.getRepository(Tenant);
      await tenantRepo.save(tenantData);

      const response = await request(app)
        .get(`/tenants/${id}`)
        .set("Cookie", [`accessToken=${adminToken}`]);

      expect((response.body as Record<string, string>).id).toBe(id);
    });

    test("should return 404 status if tenant not found", async () => {
      const tenantData = {
        name: "Tenant Name",
        address: "Tenant address",
      };

      const tenantRepo = connection.getRepository(Tenant);
      await tenantRepo.save(tenantData);

      const response = await request(app)
        .get("/tenant/2")
        .set("Cookie", [`accessToken=${adminToken}`]);
      expect(response.status).toBe(404);
    });
  });

  describe("ID is missing", () => {
    test("should return 422 status if null is passed as ID", async () => {
      const tenantData = {
        name: "Tenant name",
        address: "Tenant address",
      };

      const tenantRepo = connection.getRepository(Tenant);
      await tenantRepo.save(tenantData);

      const response = await request(app)
        .get("/tenants/null")
        .set("Cookie", [`accessToken=${adminToken}`]);

      expect(response.status).toBe(422);
    });
  });
});
