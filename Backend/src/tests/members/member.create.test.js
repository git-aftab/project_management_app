import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../../app.js";
import { User } from "../../models/user.model.js";
import { Project } from "../../models/project.models.js";
import { ProjectMember } from "../../models/projectmember.models.js";

async function createTestUser() {
  const user = await User.create({
    username: "testUser",
    email: "test@example.com",
    fullName: "Test User",
    password: "pass@123",
  });

  const accessToken = user.generateAccessToken();

  return { user, accessToken };
}

describe("POST api/v1/projects/:projectId", () => {
  it("allows an admin to add a member by username", async () => {
    const { user: admin, accessToken: adminToken } = await createTestUser();
    const member = await User.create({
      username: "newmember",
      email: "newmember@example.com",
      fullName: "New Member",
      password: "pass@123",
    });
    const project = await Project.create({
      name: "test project",
      description: "test project description",
      createdBy: admin._id,
    });
    await ProjectMember.create({ user: admin._id, project: project._id, role: "admin" });

    const response = await request(app)
      .post(`/api/v1/projects/${project._id}/members`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ username: member.username, role: "member" });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.user.toString()).toBe(member._id.toString());
    expect(response.body.data.role).toBe("member");
  });
});
