import request from "supertest";
import app from "../../src/app";

describe("GET /auth/self", () => {
  describe("Given all fields", () => {
    test("should return 200 status code", async () => {
      const response = await request(app).get("/auth/self");
      expect(response.status).toBe(200);
    });
  });
});
