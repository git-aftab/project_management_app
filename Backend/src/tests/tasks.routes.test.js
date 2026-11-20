import request from "supertest";
import mongoose from "mongoose";
import { describe, expect, it } from "vitest";
import app from "../app.js";
import { User } from "../models/user.model.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { Tasks } from "../models/task.models.js";
import { subTask } from "../models/subtask.models.js";

async function setup(role = "admin") {
  const user = await User.create({ username: "tasksuser", email: "tasks@example.com", fullName: "Tasks User", password: "Password@123" });
  const project = await Project.create({ name: "Tasks Project", description: "Tasks test", createdBy: user._id });
  await ProjectMember.create({ user: user._id, project: project._id, role });
  return { user, project, token: user.generateAccessToken() };
}

describe("project task routes", () => {
  it("requires authentication", async () => {
    const response = await request(app).get(`/api/v1/tasks/${new mongoose.Types.ObjectId()}`);
    expect(response.statusCode).toBe(401);
  });

  it("creates and lists tasks", async () => {
    const { project, token } = await setup();
    const created = await request(app).post(`/api/v1/tasks/${project._id}`).set("Authorization", `Bearer ${token}`).send({ title: "Ship feature", description: "First task" });
    expect(created.statusCode).toBe(201);
    expect(created.body.data.title).toBe("Ship feature");
    const listed = await request(app).get(`/api/v1/tasks/${project._id}`).set("Authorization", `Bearer ${token}`);
    expect(listed.statusCode).toBe(200);
    expect(listed.body.data).toHaveLength(1);
  });

  it("fetches, updates, and deletes a task and its subtasks", async () => {
    const { user, project, token } = await setup();
    const task = await Tasks.create({ title: "Draft", description: "Draft details", project: project._id, assignedBy: user._id });
    const child = await subTask.create({ title: "Outline", task: task._id, createdBy: user._id });
    const taskUrl = `/api/v1/tasks/${project._id}/t/${task._id}`;
    const fetched = await request(app).get(taskUrl).set("Authorization", `Bearer ${token}`);
    expect(fetched.statusCode).toBe(201);
    expect(fetched.body.data._id).toBe(task._id.toString());
    const updated = await request(app).put(taskUrl).set("Authorization", `Bearer ${token}`).send({ title: "Final draft", status: "in_progress" });
    expect(updated.statusCode).toBe(200);
    expect(updated.body.data.title).toBe("Final draft");
    const deleted = await request(app).delete(taskUrl).set("Authorization", `Bearer ${token}`);
    expect(deleted.statusCode).toBe(200);
    expect(await Tasks.findById(task._id)).toBeNull();
    expect(await subTask.findById(child._id)).toBeNull();
  });

  it("creates, updates, and deletes subtasks", async () => {
    const { user, project, token } = await setup();
    const task = await Tasks.create({ title: "Parent", description: "Details", project: project._id, assignedBy: user._id });
    const created = await request(app).post(`/api/v1/tasks/${project._id}/t/${task._id}/subtasks`).set("Authorization", `Bearer ${token}`).send({ title: "Child" });
    expect(created.statusCode).toBe(200);
    const childId = created.body.data._id;
    const updated = await request(app).put(`/api/v1/tasks/${project._id}/st/${childId}`).set("Authorization", `Bearer ${token}`).send({ isCompleted: true });
    expect(updated.statusCode).toBe(200);
    expect(updated.body.data.isCompleted).toBe(true);
    const deleted = await request(app).delete(`/api/v1/tasks/${project._id}/st/${childId}`).set("Authorization", `Bearer ${token}`);
    expect(deleted.statusCode).toBe(200);
  });

  it("denies task creation to a regular project member", async () => {
    const { project, token } = await setup("member");
    const response = await request(app).post(`/api/v1/tasks/${project._id}`).set("Authorization", `Bearer ${token}`).send({ title: "Nope", description: "Nope" });
    expect(response.statusCode).toBe(403);
  });
});
