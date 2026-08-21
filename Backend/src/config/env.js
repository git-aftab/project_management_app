import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),
  ACCESS_TOKEN_SECRET: z.string().min(32, "ACCESS_TOKEN_SECRET must be at least 32 characters"),
  ACCESS_TOKEN_EXPIRY: z.string().min(1, "ACCESS_TOKEN_EXPIRY is required"),
  REFRESH_TOKEN_SECRET: z.string().min(32, "REFRESH_TOKEN_SECRET must be at least 32 characters"),
  REFRESH_TOKEN_EXPIRY: z.string().min(1, "REFRESH_TOKEN_EXPIRY is required"),
  CORS_ORIGIN: z.string().min(1, "CORS_ORIGIN is required"),
  CLIENT_URL: z.string().url("CLIENT_URL must be a valid URL"),
  FORGOT_PASSWORD_REDIRECT_URL: z
    .string()
    .url("FORGOT_PASSWORD_REDIRECT_URL must be a valid URL"),
  SERVER_URL: z.string().url("SERVER_URL must be a valid URL"),
  MAILTRAP_SMTP_HOST: z.string().min(1, "MAILTRAP_SMTP_HOST is required"),
  MAILTRAP_SMTP_PORT: z.coerce.number().int().positive(),
  MAILTRAP_SMTP_USER: z.string().min(1, "MAILTRAP_SMTP_USER is required"),
  MAILTRAP_SMTP_PASS: z.string().min(1, "MAILTRAP_SMTP_PASS is required"),
});

export const validateEnv = (environment) => envSchema.parse(environment);
