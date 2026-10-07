import mongoose from "mongoose";

const ClaimRequestSchema = new mongoose.Schema(
  {
    mandapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mandap",
      required: true,
      index: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    committeeRole: {
      type: String,
      required: [true, "Your designation/role in the committee is required"],
      trim: true,
    },
    contactPhone: {
      type: String,
      required: [true, "Contact phone is required"],
      trim: true,
    },
    contactEmail: {
      type: String,
      required: [true, "Official email is required"],
      trim: true,
    },
    verificationDocUrl: {
      type: String,
      default: "",
    },
    proofNotes: {
      type: String,
      required: [true, "Details or social media links verifying ownership are required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    reviewNotes: {
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

export const ClaimRequest = mongoose.model("ClaimRequest", ClaimRequestSchema);
