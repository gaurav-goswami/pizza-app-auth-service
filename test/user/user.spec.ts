import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
import createJWKSMock from "mock-jwks";

describe("GET /auth/self", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
    jwks = createJWKSMock("http://localhost:5501");
  });

  beforeEach(async () => {
    jwks.start();
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Given all fields", () => {
    test("should return 200 status code", async () => {
      const accessToken = jwks.token({
        sub: "1",
        role: Roles.CUSTOMER,
      });

      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken};`])
        .send();
      expect(response.status).toBe(200);
    });

    test("should return the user data", async () => {
      const data = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@gmail.com",
        password: "johndoe1234",
      };

      const userRepository = connection.getRepository(User);
      const userData = await userRepository.save({
        ...data,
        role: Roles.CUSTOMER,
      });

      const accessToken = jwks.token({
        sub: String(userData.id),
        role: userData.role,
      });

      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken};`]);

      expect((response.body as Record<string, string>).id).toBe(userData.id);
    });
  });
});
