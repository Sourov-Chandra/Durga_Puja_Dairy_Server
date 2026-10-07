import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    mandapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mandap",
      required: true,
      index: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "INCORRECT_LOCATION",
        "DUPLICATE_MANDAP",
        "WRONG_SCHEDULE",
        "INAPPROPRIATE_PHOTO",
        "FAKE_LISTING",
        "OTHER",
      ],
      required: true,
    },
    description: {
      type: String,
      required: [true, "Report description is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["OPEN", "UNDER_REVIEW", "RESOLVED", "DISMISSED"],
      default: "OPEN",
      index: true,
    },
    resolutionNotes: {
      type: String,
      default: "",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Report = mongoose.model("Report", ReportSchema);
