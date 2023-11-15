import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import bcrypt from "bcrypt";
import { User } from "../../src/entity/User";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";

describe("POST /auth/login", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Given all fields", () => {
    test("should check the valid json response", async () => {
      const data = {
        email: "johndoe@gmail.com",
        password: "johndoe1234",
      };

      const response = await request(app).post("/auth/login").send(data);
      expect(
        (response.headers as Record<string, string>)["content-type"],
      ).toEqual(expect.stringContaining("json"));
    });

    test("should return status 400 if email or password is incorrect", async () => {
      const data = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@gmail.com",
        password: "johndoe1234",
        role: Roles.CUSTOMER,
      };

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const userRepository = connection.getRepository(User);
      await userRepository.save({ ...data, password: hashedPassword });

      const response = await request(app)
        .post("/auth/login")
        .send({ ...data, password: "nottherealpassword" });
      expect(response.status).toBe(400);
    });
  });

  describe("Fields are missing", () => {});
});
