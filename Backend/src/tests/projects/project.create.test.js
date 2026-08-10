import mongoose from "mongoose";
import request from "supertest";
import { describe, it, expect } from "vitest";
import { User } from "../../models/user.model.js";
import app from "../../app.js";
import { email } from "zod";
import { response } from "express";

async function createTestUser() {
  const user = await User.create({
    username: "testuser",
    email: "test@example.com",
    fullName: "Test User",
    password: "Password@123",
  });

  const accessToken = user.generateAccessToken();

  return { user, accessToken };
}

describe("POST /api/v1/projects", () => {
  it("should create a project successfully", async () => {
    const { user, accessToken } = await createTestUser();

    const response = await request(app)
      .post("/api/v1/projects")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Integration Test Project",
        description: "Created through API test",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.name).toBe("Integration Test Project");
    expect(response.body.data.description).toBe("Created through API test");
    expect(response.body.data.createdBy).toBe(user._id.toString());
  });
});
