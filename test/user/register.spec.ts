import app from "../../src/app";
import request from "supertest";

describe("POST /auth/register", () => {
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

    test("should persist ");
  });

  describe("Fields are missing", () => {});
});
