import mongoose, { Schema } from "mongoose";

const projectNotesSchema = new Schema(
  {
    project: {
      // what project does this notes belongs to
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps },
);

export const projectNotes = mongoose.model("ProjectNotes", projectNotesSchema);
