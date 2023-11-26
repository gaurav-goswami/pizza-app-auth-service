import request from "supertest";
import app from "../../src/app";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";
import { AppDataSource } from "../../src/config/data-source";
import { DataSource } from "typeorm";

describe("GET /tenants", () => {
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

  test("should return 200 status code", async () => {
    const response = await request(app)
      .get("/tenants")
      .set("Cookie", [`accessToken=${adminToken}`]);
    expect(response.status).toBe(200);
  });

  test("should return 401 status code if user is not admin", async () => {
    const response = await request(app).get("/tenants");
    expect(response.status).toBe(401);
  });
});
