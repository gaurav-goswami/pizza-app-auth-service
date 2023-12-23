import request from "supertest";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";
import { User } from "../../src/entity/User";
import bcrypt from "bcryptjs";

describe("POST /auth/logout", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
    jwks = createJWKSMock("http://localhost:5500");
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

  test("should clear the cookies", async () => {
    interface Headers {
      ["set-cookie"]: string[];
    }

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

    await request(app)
      .post("/auth/login")
      .send({ email: data.email, password: data.password });

    const response = await request(app).post("/auth/logout");
    const cookies = (response.headers as Headers)["set-cookie"] || [];
    expect(cookies).toHaveLength(0);
  });
});
