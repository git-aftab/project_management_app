import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../../app.js";
import { User } from "../../models/user.model.js";
import { Project } from "../../models/project.models.js";
import { deleteCache } from "../../utils/cache.js";
import { ProjectMember } from "../../models/projectmember.models.js";

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

describe("GET /api/v1/projects", () => {
  it("should get projects successfully", async () => {
    const { user, accessToken } = await createTestUser();

    const project1 = await Project.create({
      name: "Project One",
      description: "First test project",
      createdBy: user._id,
    });

    await ProjectMember.create({
      user: user._id,
      project: project1._id,
      role: "admin",
    });
    await deleteCache(`projects:${user._id}`);

    const project2 = await Project.create({
      name: "Project two",
      description: "Second test project",
      createdBy: user._id,
    });

    await ProjectMember.create({
      user: user._id,
      project: project2._id,
      role: "admin",
    });
    await deleteCache(`projects:${user._id}`);

    const projectsInDb = await Project.find({});
    console.log("PROJECTS IN DB:", projectsInDb.length);
    console.log("PROJECTS: ", projectsInDb);

    const res = await request(app)
      .get("/api/v1/projects")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);

    expect(res.body.success).toBe(true);

    expect(res.body.data).toBeDefined();

    expect(res.body.data.length).toBe(2);
  });
});

describe("GET /api/v1/projects/:projectId", () => {
  it("Should Get project by id successfully", async () => {
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
      .get(`/api/v1/projects/${project._id}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    expect(res.body.data).toBeDefined();

    expect(res.body.data._id).toBe(project._id.toString());
    expect(res.body.data.name).toBe("test project");
    expect(res.body.data.description).toBe("project description");
  });
});
