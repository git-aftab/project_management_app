import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../../app.js";
import { User } from "../../models/user.model.js";
import { Project } from "../../models/project.models.js";
import { ProjectMember } from "../../models/projectmember.models.js";
import { deleteCache } from "../../utils/cache.js";

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

describe("DELETE /api/v1/projects/:projectId", () => {
  it("should delete a project successfully", async () => {
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
      .delete(`/api/v1/projects/${project._id}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(project._id.toString());
    expect(res.body.message).toBe("Project Deleted Successfully");

    const deletedProject = await Project.findById(project._id);
    expect(deletedProject).toBeNull();
  });

  it("should reject a delete request without authentication", async () => {
    const res = await request(app).delete(
      "/api/v1/projects/507f1f77bcf86cd799439011",
    );

    expect(res.statusCode).toBe(401);
  });
});
