import mongoose from "mongoose";

const ScheduleSchema = new mongoose.Schema(
  {
    mandapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mandap",
      required: true,
      index: true,
    },
    day: {
      type: String,
      required: [true, "Day is required (e.g., Mahalaya, Maha Ashtami)"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Ritual title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
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
    priestName: {
      type: String,
      trim: true,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
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

ScheduleSchema.index({ mandapId: 1, date: 1, order: 1 });

export const Schedule = mongoose.model("Schedule", ScheduleSchema);
