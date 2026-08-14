import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../../app.js";
import { User } from "../../models/user.model.js";
import { Project } from "../../models/project.models.js";
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

describe("GET /api/v1/projects", () => {
  it("should get project successfully", async () => {
    const { user, accessToken } = await createTestUser();

    await Project.create({
      name: "Project One",
      description: "First test project",
      createdBy: user._id,
    });
    await deleteCache(`projects:${user._id}`);
    
    await Project.create({
        name: "Project two",
      description: "Second test project",
      createdBy: user._id,
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
