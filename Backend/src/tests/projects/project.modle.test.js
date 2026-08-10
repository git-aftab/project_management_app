import mongoose from "mongoose";
import { describe, it, expect } from "vitest";
import { Project } from "../../models/project.models.js";

describe("Project Model", () => {
  it("Should create a project successfully", async () => {
    const project = await Project.create({
      name: "Test Project",
      description: "Testing Project Model",
      createdBy: new mongoose.Types.ObjectId(),
    });

    expect(project).toBeDefined();
    expect(project.name).toBe("Test Project");
    expect(project.description).toBe("Testing Project Model");
  });
});
