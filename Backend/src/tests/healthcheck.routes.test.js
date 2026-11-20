import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../app.js";

describe("GET /api/v1/healthcheck", () => {
  it("reports that the server is running", async () => {
    const response = await request(app).get("/api/v1/healthcheck");
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.message).toBe("Server is running");
  });
});
