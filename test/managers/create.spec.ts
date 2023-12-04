import createJWKSMock from "mock-jwks";
import request from "supertest";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";
import app from "../../src/app";
import { User } from "../../src/entity/User";

describe("POST /users", () => {
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

  test("should return status 201", async () => {
    const tenantData = {
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@gmail.com",
      password: "johndoe1234",
      tenantId: 1,
    };

    const response = await request(app)
      .post("/users")
      .set("Cookie", [`accessToken=${adminToken}`])
      .send({ ...tenantData, role: Roles.MANAGER });

    expect(response.status).toBe(201);
  });

  test("should persist user in the database", async () => {
    const tenantData = {
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@gmail.com",
      password: "johndoe1234",
      tenantId: 1,
    };

    await request(app)
      .post("/users")
      .set("Cookie", [`accessToken=${adminToken}`])
      .send({ ...tenantData, role: Roles.MANAGER });

    const userRepo = connection.getRepository(User);
    const users = await userRepo.find();

    expect(users).toHaveLength(1);
    expect(users[0].email).toBe(tenantData.email);
  });

  test("should create a manager user", async () => {
    const tenantData = {
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@gmail.com",
      password: "johndoe1234",
      tenantId: 1,
    };

    await request(app)
      .post("/users")
      .set("Cookie", [`accessToken=${adminToken}`])
      .send({ ...tenantData, role: Roles.MANAGER });

    const userRepo = connection.getRepository(User);
    const users = await userRepo.find();

    expect(users).toHaveLength(1);
    expect(users[0].role).toBe(Roles.MANAGER);
  });

  test("should ensure that only admin can create managers", async () => {
    const tenantData = {
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@gmail.com",
      password: "johndoe1234",
      tenantId: 1,
    };
    const managerToken = jwks.token({
      sub: "2",
      role: Roles.MANAGER,
    });
    const response = await request(app)
      .post("/users")
      .set("Cookie", [`accessToken=${managerToken}`])
      .send(tenantData);

    expect(response.status).toBe(403);
  });
});
