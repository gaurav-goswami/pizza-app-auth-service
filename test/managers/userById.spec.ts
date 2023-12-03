import createJWKSMock from "mock-jwks";
import request from "supertest";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";
import app from "../../src/app";

describe("GET /users/id", () => {
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken: string;
  let connection: DataSource;

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
      .get("/users/1")
      .set("Cookie", [`accessToken=${adminToken}`]);

    expect(response.status).toBe(200);
  });

  test("should ensure that only admin can access", async () => {
    const userToken = jwks.token({
      sub: "2",
      role: Roles.CUSTOMER,
    });
    const response = await request(app)
      .get("/users/1")
      .set("Cookie", [`accessToken=${userToken}`]);

    expect(response.status).toBe(403);
  });
});
