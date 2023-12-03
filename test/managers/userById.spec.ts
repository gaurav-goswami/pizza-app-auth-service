import createJWKSMock from "mock-jwks";
import request from "supertest";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";
import app from "../../src/app";
import { User } from "../../src/entity/User";

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

  describe("Given ID", () => {
    test("should return 200 status code", async () => {
      const data = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@gmail.com",
        password: "johndoe1234",
        tenantId: 1,
      };

      const userRepo = connection.getRepository(User);
      await userRepo.save({ ...data, role: Roles.MANAGER });

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

    test("should return user with the same ID", async () => {
      const id = 1;

      const data = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@gmail.com",
        password: "johndoe1234",
        tenantId: 1,
      };

      const userRepo = connection.getRepository(User);
      await userRepo.save({ ...data, role: Roles.MANAGER });

      const response = await request(app)
        .get(`/users/${id}`)
        .set("Cookie", [`accessToken=${adminToken}`]);

      expect((response.body as Record<string, string>).id).toBe(id);
    });
  });
});
