import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../../app.js";
import { User } from "../../models/user.model.js";
import { Project } from "../../models/project.models.js";
import mongoose from "mongoose";
import { ProjectMember } from "../../models/projectmember.models.js";
import { deleteCache } from "../../utils/cache.js";

async function createTestUser() {
  const user = User.create({
    username: "testUser",
    email: "test@example.com",
    fullName: "Test User",
    password: "pass@123",
  });

  const accessToken = user.generateAccessToken();

  return { user, accessToken };
}

describe("POST api/v1/projects/:projectId", () => {
  it("should allow admin to add memebers", async () => {
    const { user: admin, accessToken: adminToken } = await createTestUser();

    const project = Project.create({
      name: "test project",
      description: "test project description",
      createdBy: admin._id,
    });
  });
});
