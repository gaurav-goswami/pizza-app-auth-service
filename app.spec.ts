import app from "./src/app";
import { calculatePrice } from "./src/calculateFinalPrice";
import request from "supertest";

describe("App", () => {
  it("should calculate the final price", () => {
    const finalPrice = calculatePrice(200, 20, 40, 56);
    expect(finalPrice).toBe(236);
  });

  it("should return 201 status code", async () => {
    const response = await request(app).get("/").send();
    expect(response.status).toBe(201);
  });
});
