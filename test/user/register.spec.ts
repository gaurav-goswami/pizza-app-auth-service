import { DataSource } from "typeorm";
import app from "../../src/app";
import request from "supertest";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
import { isJwt } from "../utils";
// import truncateTables from "../utils";

describe("POST /auth/register", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    // await truncateTables(connection);
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Given all fields", () => {
    test("should return status code 201", async () => {
      const data = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@gmail.com",
        password: "johndoe1234",
      };
      const response = await request(app).post("/auth/register").send(data);
      expect(response.status).toBe(201);
    });

    test("should check the valid json response", async () => {
      const data = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@gmail.com",
        password: "johndoe1234",
      };
      const response = await request(app).post("/auth/register").send(data);
      expect(
        (response.headers as Record<string, string>)["content-type"],
      ).toEqual(expect.stringContaining("json"));
    });

    test("should persist user in the database", async () => {
      // Arrange
      const data = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@gmail.com",
        password: "johndoe1234",
      };
      // Act
      await request(app).post("/auth/register").send(data);
      // Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(1);
      expect(users[0].firstName).toBe(data.firstName);
      expect(users[0].lastName).toBe(data.lastName);
      expect(users[0].email).toBe(data.email);
    });

    test("should assign customer role", async () => {
      const data = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@gmail.com",
        password: "johndoe1234",
      };

      await request(app).post("/auth/register").send(data);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users[0]).toHaveProperty("role");
      expect(users[0].role).toBe(Roles.CUSTOMER);
    });

    test("should hash the password in the database", async () => {
      // Arrange
      const data = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@gmail.com",
        password: "johndoe1234",
      };

      // Act
      await request(app).post("/auth/register").send(data);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      // Assert
      expect(users[0].password).not.toBe(data.password);
      expect(users[0].password).toHaveLength(60);
      expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
    });

    test("should return 400 status code if email already exists", async () => {
      const data = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@gmail.com",
        password: "johndoe1234",
      };
      const userRepository = connection.getRepository(User);
      await userRepository.save({ ...data, role: Roles.CUSTOMER });

      const response = await request(app).post("/auth/register").send(data);
      const users = await userRepository.find();

      expect(response.status).toBe(400);
      expect(users).toHaveLength(1);
    });

    test("should return the access and refresh token inside a cookie", async () => {
      const data = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@gmail.com",
        password: "johndoe1234",
      };

      interface Headers {
        ["set-cookie"]: string[];
      }

      const response = await request(app).post("/auth/register").send(data);

      // cookie example
      // accessToken=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjkzOTA5Mjc2LCJleHAiOjE2OTM5MDkzMzYsImlzcyI6Im1lcm5zcGFjZSJ9.KetQMEzY36vxhO6WKwSR-P_feRU1yI-nJtp6RhCEZQTPlQlmVsNTP7mO-qfCdBr0gszxHi9Jd1mqf-hGhfiK8BRA_Zy2CH9xpPTBud_luqLMvfPiz3gYR24jPjDxfZJscdhE_AIL6Uv2fxCKvLba17X0WbefJSy4rtx3ZyLkbnnbelIqu5J5_7lz4aIkHjt-rb_sBaoQ0l8wE5KzyDNy7mGUf7cI_yR8D8VlO7x9llbhvCHF8ts6YSBRBt_e2Mjg5txtfBaDq5auCTXQ2lmnJtMb75t1nAFu8KwQPrDYmwtGZDkHUcpQhlP7R-y3H99YnrWpXbP8Zr_oO67hWnoCSw; Max-Age=43200; Domain=localhost; Path=/; Expires=Tue, 05 Sep 2023 22:21:16 GMT; HttpOnly; SameSite=Strict

      let accessToken = null;
      let refreshToken = null;
      const cookies = (response.headers as Headers)["set-cookie"] || [];
      cookies.forEach((cookie) => {
        if (cookie.startsWith("accessToken=")) {
          accessToken = cookie.split(";")[0].split("=")[1];
        }

        if (cookie.startsWith("refreshToken=")) {
          refreshToken = cookie.split(";")[0].split("=")[1];
        }
      });

      expect(accessToken).not.toBeNull();
      expect(refreshToken).not.toBeNull();
      expect(isJwt(accessToken)).toBeTruthy();
      expect(isJwt(refreshToken)).toBeTruthy();
    });
  });
  ``;

  describe("Fields are missing", () => {
    test("should return 400 status code if email is missing", async () => {
      const data = {
        firstName: "John",
        lastName: "Doe",
        email: "",
        password: "johndoe1234",
      };

      const response = await request(app).post("/auth/register").send(data);
      expect(response.status).toBe(400);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });

    test("should return 400 status code if firstName is missing", async () => {
      const data = {
        firstName: "",
        lastName: "Doe",
        email: "johndoe@gmail.com",
        password: "johndoe1234",
      };

      const response = await request(app).post("/auth/register").send(data);
      expect(response.status).toBe(400);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });

    test("should return 400 status code if lastName is missing", async () => {
      const data = {
        firstName: "John",
        lastName: "",
        email: "johndoe@gmail.com",
        password: "johndoe1234",
      };

      const response = await request(app).post("/auth/register").send(data);
      expect(response.status).toBe(400);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });

    test("should return 400 status code if password is missing", async () => {
      const data = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@gmail.com",
        password: "",
      };

      const response = await request(app).post("/auth/register").send(data);
      expect(response.status).toBe(400);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });
  });

  describe("Fields are in not proper format", () => {
    test("should trim the whitespaces from email", async () => {
      // Arrange
      const data = {
        firstName: "John",
        lastName: "Doe",
        email: " johndoe@gmail.com ",
        password: "johndoe1234",
      };

      await request(app).post("/auth/register").send(data);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users[0].email).toBe("johndoe@gmail.com");
    });

    test("should return 400 status code if email is not valid", async () => {
      const data = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe.gmail,com",
        password: "johndoe1234",
      };

      const response = await request(app).post("/auth/register").send(data);
      expect(response.status).toBe(400);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users).toHaveLength(0);
    });

    test("should return 400 status code if password length is less than 8 characters", async () => {
      const data = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@gmail.com",
        password: "short",
      };

      const response = await request(app).post("/auth/register").send(data);
      expect(response.status).toBe(400);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });

    test("should return an array of error of error messages if email is missing", async () => {
      const data = {
        firstName: "John",
        lastName: "Doe",
        email: "",
        password: "johndoe1234",
      };

      const response = await request(app).post("/auth/register").send(data);
      expect(response.body).toHaveProperty("error");
      expect(
        (response.body as Record<string, string>).error.length,
      ).toBeGreaterThan(0);
    });
  });
});
