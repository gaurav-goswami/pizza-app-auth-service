import createJWKSMock from "mock-jwks";
import request from "supertest";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";
import app from "../../src/app";
import { User } from "../../src/entity/User";

describe("PATCH /users/id", () => {
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken: string;
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
    jwks = createJWKSMock("http://localhost:5501");
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
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
      const id = "1";
      const updatedData = {
        firstName: "John (new)",
        lastName: "Doe (new)",
        email: "johndoenew@gmail.com",
      };

      const response = await request(app)
        .patch(`/users/${id}`)
        .set("Cookie", [`accessToken=${adminToken}`])
        .send({ ...updatedData, role: Roles.MANAGER });

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

    test("should update the user in database", async () => {
      const managerData = {
        firstName: "John",
        lastName: "Doe",
        email: "johnDoe@gmail.com",
        password: "johndoe1234",
        tenantId: 2,
      };

      const userRepo = connection.getRepository(User);
      await userRepo.save({ ...managerData, role: Roles.MANAGER });

      const updatedDetails = {
        firstName: "John (new)",
        lastName: "Doe (new)",
        role: Roles.MANAGER,
      };

      await request(app)
        .patch("/users/1")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(updatedDetails);

      const user = await userRepo.find();
      expect(user[0].firstName).toBe(updatedDetails.firstName);
      expect(user[0].lastName).toBe(updatedDetails.lastName);
      expect(user[0].role).toBe(updatedDetails.role);
    });
  });

  describe("ID is missing", () => {
    test("should return 422 status if null is passed as ID or ID is missing", async () => {
      const response = await request(app)
        .get(`/users/null`)
        .set("Cookie", [`accessToken=${adminToken}`]);

      expect(response.status).toBe(422);
    });
  });
});
