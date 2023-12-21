import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import bcrypt from "bcryptjs";
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

    test("should return access token and refresh token in cookies", async () => {
      interface Headers {
        ["set-cookie"]: string[];
      }

      let accessToken = null;
      let refreshToken = null;

      const data = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@gmail.com",
        password: "johndoe1234",
        role: Roles.CUSTOMER,
      };

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const userRepository = connection.getRepository(User);
      await userRepository.save({
        ...data,
        password: hashedPassword,
      });

      const response = await request(app)
        .post("/auth/login")
        .send({ email: data.email, password: data.password });

      const cookies = (response.headers as Headers)["set-cookie"] || [];
      cookies.forEach((token) => {
        if (token.startsWith("accessToken=")) {
          accessToken = token.split(";")[0].split("=")[1];
        }
        if (token.startsWith("refreshToken=")) {
          refreshToken = token.split(";")[0].split("=")[1];
        }
      });

      expect(accessToken).not.toBe(null);
      expect(refreshToken).not.toBe(null);
    });
  });

  describe("Fields are missing", () => {
    test("should return array of error if email is missing", async () => {
      const data = {
        password: "johndoe1234",
      };
      const response = await request(app).post("/auth/login").send(data);
      expect(
        (response.body as Record<string, string>).error.length,
      ).toBeGreaterThan(0);
    });

    test("should return array of error if password is missing", async () => {
      const data = {
        email: "johndoe@gmail.com",
      };
      const response = await request(app).post("/auth/login").send(data);
      expect(
        (response.body as Record<string, string>).error.length,
      ).toBeGreaterThan(0);
    });
  });
});
