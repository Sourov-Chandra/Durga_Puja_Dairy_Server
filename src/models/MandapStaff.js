import mongoose from "mongoose";

const MandapStaffSchema = new mongoose.Schema(
  {
    mandapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mandap",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["STAFF", "CO_MANAGER"],
      default: "STAFF",
    },
    permissions: {
      type: [String],
      enum: [
        "MANAGE_SCHEDULE",
        "MANAGE_EVENTS",
        "MANAGE_GALLERY",
        "POST_ANNOUNCEMENTS",
      ],
      default: [
        "MANAGE_SCHEDULE",
        "MANAGE_EVENTS",
        "MANAGE_GALLERY",
        "POST_ANNOUNCEMENTS",
      ],
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

MandapStaffSchema.index({ mandapId: 1, userId: 1 }, { unique: true });

export const MandapStaff = mongoose.model("MandapStaff", MandapStaffSchema);
