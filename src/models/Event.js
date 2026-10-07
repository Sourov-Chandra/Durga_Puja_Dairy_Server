import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    mandapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mandap",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      enum: [
        "CULTURAL_PROGRAM",
        "MUSIC_CONCERT",
        "DHAK_COMPETITION",
        "DRAMA_NATOK",
        "DANCE_PERFORMANCE",
        "AARTI_DHUNUCHI",
        "BHOG_DISTRIBUTION",
        "PROCESSION_BISORJON",
        "OTHER",
      ],
      default: "CULTURAL_PROGRAM",
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      trim: true,
    },
    endTime: {
      type: String,
      trim: true,
      default: "",
    },
    venueOrStage: {
      type: String,
      trim: true,
      default: "Mandap Premises",
    },
    performers: {
      type: String,
      trim: true,
      default: "",
    },
    coverImage: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["SCHEDULED", "LIVE", "COMPLETED", "CANCELLED"],
      default: "SCHEDULED",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

EventSchema.index({ mandapId: 1, date: 1 });

export const Event = mongoose.model("Event", EventSchema);
