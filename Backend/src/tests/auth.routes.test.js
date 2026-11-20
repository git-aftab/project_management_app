import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../services/s3.service.js", () => ({
  createDownloadURL: vi.fn(async ({ key }) => `https://cdn.example/${key}`),
  createUploadURL: vi.fn(async ({ key }) => `https://upload.example/${key}`),
}));
vi.mock("../utils/mail.js", () => ({
  sendEmail: vi.fn(async () => undefined),
  emailVerificationMailgenContent: vi.fn(() => "verification"),
  forgotPasswordMailgenContent: vi.fn(() => "reset"),
}));

import request from "supertest";
import crypto from "crypto";
import app from "../app.js";
import { User } from "../models/user.model.js";

async function createUser() {
  const user = await User.create({ username: "authuser", email: "auth@example.com", fullName: "Auth User", password: "Password@123" });
  return { user, token: user.generateAccessToken() };
}

describe("auth routes", () => {
  it("registers a user and logs in by email or username", async () => {
    const registration = await request(app).post("/api/v1/auth/register").send({ username: "newuser", email: "new@example.com", fullName: "New User", password: "Password@123" });
    expect(registration.statusCode).toBe(201);
    expect(registration.body.data.user.email).toBe("new@example.com");
    expect(registration.body.data.user.password).toBeUndefined();

    const login = await request(app).post("/api/v1/auth/login").send({ email: "new@example.com", password: "Password@123" });
    expect(login.statusCode).toBe(200);
    expect(login.body.data.accessToken).toBeTruthy();
    expect(login.body.data.refreshToken).toBeTruthy();
    const byUsername = await request(app).post("/api/v1/auth/login").send({ username: "newuser", password: "Password@123" });
    expect(byUsername.statusCode).toBe(200);
  });

  it("rejects duplicate registrations and invalid credentials", async () => {
    await createUser();
    const duplicate = await request(app).post("/api/v1/auth/register").send({ username: "authuser", email: "auth@example.com", password: "Password@123" });
    expect(duplicate.statusCode).toBe(409);
    const badLogin = await request(app).post("/api/v1/auth/login").send({ email: "auth@example.com", password: "wrong" });
    expect(badLogin.statusCode).toBe(400);
  });

  it("verifies email and refreshes an access token", async () => {
    const { user } = await createUser();
    const verificationToken = user.generateTemporaryToken();
    user.emailVerificationToken = verificationToken.hashedToken;
    user.emailVerificationExpiry = verificationToken.tokenExpiry;
    await user.save({ validateBeforeSave: false });
    const verified = await request(app).get(`/api/v1/auth/verify-email/${verificationToken.unHashedToken}`);
    expect(verified.statusCode).toBe(200);
    expect((await User.findById(user._id)).isEmailVerified).toBe(true);

    const login = await request(app).post("/api/v1/auth/login").send({ email: user.email, password: "Password@123" });
    const refreshed = await request(app).post("/api/v1/auth/refresh-token").send({ refreshToken: login.body.data.refreshToken });
    expect(refreshed.statusCode).toBe(200);
    expect(refreshed.body.data.accessToken).toBeTruthy();
  });

  it("supports forgot and reset password", async () => {
    const { user } = await createUser();
    const forgot = await request(app).post("/api/v1/auth/forgot-password").send({ email: user.email });
    expect(forgot.statusCode).toBe(200);
    const stored = await User.findById(user._id);
    const resetToken = "reset-token-for-test";
    stored.forgotPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    stored.forgotPasswordTokenExpiry = Date.now() + 60_000;
    await stored.save({ validateBeforeSave: false });
    const reset = await request(app).post(`/api/v1/auth/reset-password/${resetToken}`).send({ newPassword: "NewPassword@123" });
    expect(reset.statusCode).toBe(200);
    const login = await request(app).post("/api/v1/auth/login").send({ email: user.email, password: "NewPassword@123" });
    expect(login.statusCode).toBe(200);
  });

  it("serves protected user, password, verification, and avatar routes", async () => {
    const { user, token } = await createUser();
    expect((await request(app).get("/api/v1/auth/current-user")).statusCode).toBe(401);
    const current = await request(app).get("/api/v1/auth/current-user").set("Authorization", `Bearer ${token}`);
    expect(current.statusCode).toBe(200);
    expect(current.body.data._id).toBe(user._id.toString());

    const changed = await request(app).post("/api/v1/auth/change-password").set("Authorization", `Bearer ${token}`).send({ oldPassword: "Password@123", newPassword: "AnotherPassword@123" });
    expect(changed.statusCode).toBe(200);
    const resend = await request(app).post("/api/v1/auth/resend-email-verification").set("Authorization", `Bearer ${token}`);
    expect(resend.statusCode).toBe(200);
    const avatar = await request(app).get("/api/v1/auth/avatar").set("Authorization", `Bearer ${token}`);
    expect(avatar.statusCode).toBe(200);
    expect(avatar.body.data).toBeNull();
    const updated = await request(app).patch("/api/v1/auth/update-avatar").set("Authorization", `Bearer ${token}`).send({ key: "avatars/profile.png" });
    expect(updated.statusCode).toBe(200);
    expect(updated.body.data.avatar.url).toBe("https://cdn.example/avatars/profile.png");
    const avatarUrl = await request(app).get("/api/v1/auth/avatar").set("Authorization", `Bearer ${token}`);
    expect(avatarUrl.body.data).toBe("https://cdn.example/avatars/profile.png");

    const logout = await request(app).post("/api/v1/auth/logout").set("Authorization", `Bearer ${token}`);
    expect(logout.statusCode).toBe(200);
    expect((await User.findById(user._id)).refreshToken).toBe("");
  });

  it("creates a presigned upload URL with optional authentication", async () => {
    const response = await request(app).post("/api/v1/auth/presign").send({ fileName: "avatar.png", contentType: "image/png" });
    expect(response.statusCode).toBe(200);
    expect(response.body.data.url).toContain("https://upload.example/");
    expect(response.body.data.key).toMatch(/^user\/temp\/profile\//);
    const invalid = await request(app).post("/api/v1/auth/presign").send({ fileName: "x.txt", contentType: "text/plain" });
    expect(invalid.statusCode).toBe(400);
  });
});
