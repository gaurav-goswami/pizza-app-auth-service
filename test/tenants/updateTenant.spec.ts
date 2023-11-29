import request from "supertest";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";
import app from "../../src/app";

describe("PUT /tenant/id", () => {
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
      .put("/tenants/1")
      .set("Cookie", [`accessToken=${adminToken}`])
      .send(updatedData);

    expect(response.status).toBe(204);
  });
});
