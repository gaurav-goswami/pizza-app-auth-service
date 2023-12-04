import createJWKSMock from "mock-jwks";
import request from "supertest";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";
import app from "../../src/app";

describe("PATCH /users/id", () => {
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken: string;
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
    jwks = createJWKSMock("http://localhost:5501");
  });

  beforeEach(async () => {
    await connection.synchronize();
    await connection.dropDatabase();
    jwks.start();
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

  describe("Given user ID", () => {
    test("should return 200 status code", async () => {
      const id = 1;
      const response = await request(app)
        .patch(`/users/${id}`)
        .set("Cookie", [`accessToken=${adminToken}`]);

      expect(response.status).toBe(200);
    });

    test("should ensure that only admin can access the route", async () => {
      const managerToken = jwks.token({ sub: "2", role: Roles.MANAGER });
      const id = 1;
      const response = await request(app)
        .patch(`/users/${id}`)
        .set("Cookie", [`accessToken=${managerToken}`]);

      expect(response.status).toBe(403);
    });
  });
});
