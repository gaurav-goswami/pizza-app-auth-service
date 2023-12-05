import createJWKSMock from "mock-jwks";
import request from "supertest";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";

describe("DELETE /users/id", () => {
  let jwks: ReturnType<typeof createJWKSMock>;
  let connection: DataSource;

  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5501");
    connection = await AppDataSource.initialize();
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

  describe("Given ID", () => {
    test("should return 200 status code", async () => {
      const response = await request(app).delete("/users/1");
      expect(response.status).toBe(200);
      ``;
    });
  });

  describe("ID is missing", () => {});
});
