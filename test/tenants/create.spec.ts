import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";

describe("POST /tenants", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Given all fields", () => {
    test("should return status 201", async () => {
      const tenantData = {
        name: "Tenant Name",
        address: "Tenant address",
      };

      const response = await request(app).post("/tenants").send(tenantData);
      expect(response.status).toBe(201);
    });
  });
});
