import createJWKSMock from "mock-jwks";
import request from "supertest";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
// import { Roles } from "../../src/constants";
import app from "../../src/app";

describe("GET /users", () => {
  let jwks: ReturnType<typeof createJWKSMock>;
  //   let adminToken: string;
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
    jwks = createJWKSMock("http://localhost:5501");
  });

  beforeEach(async () => {
    jwks.start();
    await connection.dropDatabase();
    await connection.synchronize();
    // adminToken = jwks.token({
    //   sub: "1",
    //   role: Roles.ADMIN,
    // });
  });

  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  test("should return status 200", async () => {
    const response = await request(app).get("/users");
    expect(response.status).toBe(200);
  });
});
