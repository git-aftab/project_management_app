import { Queue } from "bullmq";
import redis from "../config/redis.js";

export const profileQueue = new Queue("profile_img_queue", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export const avatarUploadJob = async ({ absouluteAvatarPath, userId }) => {
  await profileQueue.add("uploadAvatar", {
    avatar: absouluteAvatarPath,
    userId: userId,
  });

  console.log("Added avatar upload job to queue for user", userId);
  console.log("Path:", absouluteAvatarPath);
};
