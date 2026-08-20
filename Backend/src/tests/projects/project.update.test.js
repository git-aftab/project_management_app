import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../../app.js";
import { User } from "../../models/user.model.js";
import { Project } from "../../models/project.models.js";
import mongoose from "mongoose";
import { ProjectMember } from "../../models/projectmember.models.js";
import { deleteCache } from "../../utils/cache.js";

async function createTestUser() {
  const user = await User.create({
    username: "testuser1",
    email: "test@example.com",
    fullName: "Test User",
    password: "pass@123",
  });

  const accessToken = user.generateAccessToken();

  return { user, accessToken };
}

describe("PUT api/v1/projects/:projectID", () => {
  it("should update a project", async () => {
    const { user, accessToken } = await createTestUser();

    const project = await Project.create({
      name: "test project",
      description: "project description",
      createdBy: user._id,
    });

    await ProjectMember.create({
      user: user._id,
      project: project._id,
      role: "admin",
    });

    await deleteCache(`projects:${user._id}`);

    const res = await request(app)
      .put(`/api/v1/projects/${project._id}`)
      .set(`Authorization`, `Bearer ${accessToken}`)
      .send({
        name: "updated project",
        description: "updated description",
      });

    // const updatedProject = await Project.findById(project._id);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("updated project");
    expect(res.body.data.description).toBe("updated description");
    expect(res.body.message).toBe("Project updated successfully");
  });

  it("should reject an update without authentication", async () => {
    const res = await request(app)
      .put(`/api/v1/projects/${new mongoose.Types.ObjectId()}`)
      .send({
        name: "updated project",
        description: "updated description",
      });

    expect(res.statusCode).toBe(401);
  });

  it("should return not found when the project does not exist", async () => {
    const { user, accessToken } = await createTestUser();
    const projectId = new mongoose.Types.ObjectId();

    await ProjectMember.create({
      user: user._id,
      project: projectId,
      role: "admin",
    });

    const res = await request(app)
      .put(`/api/v1/projects/${projectId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "updated project",
        description: "updated description",
      });

    expect(res.statusCode).toBe(404);
  });
});
