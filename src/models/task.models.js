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
      Project: {
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
      },
      status: {
        type: String,
        enum: AvailableTaskStatues,
        default: TaskStatusEnum.TODO,
      },
      attachments: {
        type: [
          {
            url: String,
            mimetype: String,
            size: Number,
          },
        ],
        default: [],
      },
    },
  },
  { timestamps: true },
);

export const Tasks = mongoose.model("Tasks", TaskSchema);
