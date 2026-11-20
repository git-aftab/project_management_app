import request from "supertest";
import mongoose from "mongoose";
import { describe, expect, it } from "vitest";
import app from "../app.js";
import { User } from "../models/user.model.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { ProjectNotes } from "../models/note.models.js";

async function setup(role = "admin") {
  const user = await User.create({ username: "notesuser", email: "notes@example.com", fullName: "Notes User", password: "Password@123" });
  const project = await Project.create({ name: "Notes Project", description: "Notes test", createdBy: user._id });
  await ProjectMember.create({ user: user._id, project: project._id, role });
  return { user, project, token: user.generateAccessToken() };
}

describe("project notes routes", () => {
  it("requires authentication", async () => {
    const response = await request(app).get(`/api/v1/notes/${new mongoose.Types.ObjectId()}`);
    expect(response.statusCode).toBe(401);
  });

  it("creates and lists project notes", async () => {
    const { project, token } = await setup();
    const created = await request(app).post(`/api/v1/notes/${project._id}`).set("Authorization", `Bearer ${token}`).send({ content: "Kickoff notes" });
    expect(created.statusCode).toBe(201);
    expect(created.body.data.content).toBe("Kickoff notes");
    const listed = await request(app).get(`/api/v1/notes/${project._id}`).set("Authorization", `Bearer ${token}`);
    expect(listed.statusCode).toBe(200);
    expect(listed.body.data).toHaveLength(1);
  });

  it("fetches, updates, and deletes a note", async () => {
    const { user, project, token } = await setup();
    const note = await ProjectNotes.create({ project: project._id, createdBy: user._id, content: "Old content" });
    const url = `/api/v1/notes/${project._id}/n/${note._id}`;
    const fetched = await request(app).get(url).set("Authorization", `Bearer ${token}`);
    expect(fetched.statusCode).toBe(200);
    expect(fetched.body.data.content).toBe("Old content");
    const updated = await request(app).put(url).set("Authorization", `Bearer ${token}`).send({ content: "Updated content" });
    expect(updated.statusCode).toBe(200);
    expect(updated.body.data.content).toBe("Updated content");
    const deleted = await request(app).delete(url).set("Authorization", `Bearer ${token}`);
    expect(deleted.statusCode).toBe(200);
    expect(await ProjectNotes.findById(note._id)).toBeNull();
  });

  it("denies note writes to non-admin project members", async () => {
    const { project, token } = await setup("member");
    const response = await request(app).post(`/api/v1/notes/${project._id}`).set("Authorization", `Bearer ${token}`).send({ content: "Nope" });
    expect(response.statusCode).toBe(403);
  });
});
