import createJWKSMock from "mock-jwks";
import request from "supertest";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";
import app from "../../src/app";
import { User } from "../../src/entity/User";

describe("GET /users", () => {
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

  test("should return status 200", async () => {
    const response = await request(app)
      .get("/users")
      .set("Cookie", [`accessToken=${adminToken}`]);
    expect(response.status).toBe(200);
  });

  test("should return managers list", async () => {
    const managerData = {
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@gmail.com",
      password: "johndoe1234",
      tenantId: 1,
    };

    const userRepo = connection.getRepository(User);
    await userRepo.save({ ...managerData, role: Roles.MANAGER });

    interface IResponse {
      firstName: string;
      lastName: string;
      email: string;
      role: string;
    }

    const response = await request(app)
      .get("/users")
      .set("Cookie", [`accessToken=${adminToken}`]);

    expect((response.body as Record<string, string>).length).toBeGreaterThan(0);
    expect((response.body as IResponse[])[0].role).toBe(Roles.MANAGER);
  });
});
