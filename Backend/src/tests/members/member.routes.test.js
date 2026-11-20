import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../../app.js";
import { User } from "../../models/user.model.js";
import { Project } from "../../models/project.models.js";
import { ProjectMember } from "../../models/projectmember.models.js";

async function setup() {
  const admin = await User.create({ username: "memberadmin", email: "admin@example.com", fullName: "Admin", password: "Password@123" });
  const member = await User.create({ username: "memberuser", email: "member@example.com", fullName: "Member", password: "Password@123" });
  const project = await Project.create({ name: "Member routes", description: "Member test", createdBy: admin._id });
  const adminMembership = await ProjectMember.create({ user: admin._id, project: project._id, role: "admin" });
  return { admin, member, project, adminToken: admin.generateAccessToken(), adminMembership };
}

describe("project member routes", () => {
  it("lists members, adds a member, and changes their role", async () => {
    const { adminToken, member, project } = await setup();
    const add = await request(app).post(`/api/v1/projects/${project._id}/members`).set("Authorization", `Bearer ${adminToken}`).send({ email: member.email, role: "member" });
    expect(add.statusCode).toBe(200);
    expect(add.body.data.role).toBe("member");
    const list = await request(app).get(`/api/v1/projects/${project._id}/members`).set("Authorization", `Bearer ${adminToken}`);
    expect(list.statusCode).toBe(200);
    expect(list.body.data).toHaveLength(2);
    const role = await request(app).put(`/api/v1/projects/${project._id}/members/${member._id}`).set("Authorization", `Bearer ${adminToken}`).send({ newRole: "project_admin" });
    expect(role.statusCode).toBe(200);
    expect(role.body.data.role).toBe("project_admin");
  });

  it("removes a member and rejects unauthorized or invalid member operations", async () => {
    const { adminToken, member, project } = await setup();
    await ProjectMember.create({ user: member._id, project: project._id, role: "member" });
    const denied = await request(app).delete(`/api/v1/projects/${project._id}/members/${member._id}`);
    expect(denied.statusCode).toBe(401);
    const invalidRole = await request(app).put(`/api/v1/projects/${project._id}/members/${member._id}`).set("Authorization", `Bearer ${adminToken}`).send({ newRole: "owner" });
    expect(invalidRole.statusCode).toBe(404);
    const removed = await request(app).delete(`/api/v1/projects/${project._id}/members/${member._id}`).set("Authorization", `Bearer ${adminToken}`);
    expect(removed.statusCode).toBe(200);
    expect(await ProjectMember.findOne({ user: member._id, project: project._id })).toBeNull();
  });
});
