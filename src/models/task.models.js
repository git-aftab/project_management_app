import mongoose, { Schema } from "mongoose";
import { AvailableTaskStatues, TaskStatusEnum } from "../utils/constants.js";
// import { assign } from "nodemailer/lib/shared";

const TaskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    project: {                     
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: AvailableTaskStatues,
      default: TaskStatusEnum.TODO,
    },

    attachments: [
      {
        url: String,
        mimetype: String,
        size: Number,
      },
    ],
  },
  { timestamps: true }
);

export const Tasks = mongoose.model("Tasks", TaskSchema);
