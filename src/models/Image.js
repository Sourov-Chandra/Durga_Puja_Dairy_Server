import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema(
  {
    mandapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mandap",
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      enum: [
        "COVER",
        "IDOL_PRATIMA",
        "PANDAL_DECORATION",
        "LIGHTING",
        "RITUAL",
        "CULTURAL_PROGRAM",
        "GENERAL",
      ],
      default: "GENERAL",
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "REMOVED"],
      default: "PENDING",
      index: true,
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

ImageSchema.index({ mandapId: 1, status: 1 });

export const Image = mongoose.model("Image", ImageSchema);
