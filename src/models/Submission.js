import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Mandap name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    address: {
      addressLine1: { type: String, required: true },
      areaOrLocality: { type: String, required: true },
      cityOrDistrict: { type: String, required: true },
      stateOrDivision: { type: String, required: true },
      country: { type: String, required: true },
      countryCode: { type: String, required: true, uppercase: true },
      postalCode: { type: String },
      timezone: { type: String, default: "UTC" },
    },
    contactPhone: { type: String, trim: true },
    coverImageUrl: { type: String, default: "" },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    duplicateCheck: {
      isPotentialDuplicate: { type: Boolean, default: false },
      matchedMandapId: { type: mongoose.Schema.Types.ObjectId, ref: "Mandap" },
      matchedDistanceMeters: { type: Number },
      nameSimilarityScore: { type: Number },
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

export const Submission = mongoose.model("Submission", SubmissionSchema);
