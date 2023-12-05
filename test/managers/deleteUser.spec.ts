import createJWKSMock from "mock-jwks";
import request from "supertest";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";
import app from "../../src/app";
import { User } from "../../src/entity/User";

describe("DELETE /users/id", () => {
  let jwks: ReturnType<typeof createJWKSMock>;
  let connection: DataSource;
  let adminToken: string;

  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5501");
    connection = await AppDataSource.initialize();
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
        .delete("/users/1")
        .set("Cookie", [`accessToken=${adminToken}`]);
      expect(response.status).toBe(200);
      ``;
    });

    test("should ensure that only admin can delete a user", async () => {
      const managerToken = jwks.token({
        sub: "2",
        role: Roles.MANAGER,
      });

      const response = await request(app)
        .delete("/users/1")
        .set("Cookie", [`accessToken=${managerToken}`]);

      expect(response.status).toBe(403);
    });

    test("should delete the user from database", async () => {
      const data = {
        firstName: "John",
        lastName: "Doe",
        email: "johnDoe@gmail.com",
        password: "johndoe1234",
        tenantId: 2,
      };

      const userRepo = connection.getRepository(User);
      await userRepo.save({ ...data, role: Roles.MANAGER });

      await request(app)
        .delete("/users/1")
        .set("Cookie", [`accessToken=${adminToken}`]);

      const users = await userRepo.find();
      expect(users).toHaveLength(0);
    });
  });

  describe("ID is missing", () => {});
});
