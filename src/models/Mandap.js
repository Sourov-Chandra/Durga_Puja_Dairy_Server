import mongoose from "mongoose";

const MandapSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Mandap name is required"],
      trim: true,
      maxlength: [150, "Name cannot exceed 150 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    year: {
      type: Number,
      default: () => new Date().getFullYear(),
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, "Coordinates [longitude, latitude] are required"],
        validate: {
          validator: function (val) {
            return (
              Array.isArray(val) &&
              val.length === 2 &&
              val[0] >= -180 &&
              val[0] <= 180 && // longitude
              val[1] >= -90 &&
              val[1] <= 90 // latitude
            );
          },
          message:
            "Coordinates must be valid [longitude (-180 to 180), latitude (-90 to 90)]",
        },
      },
    },
    address: {
      addressLine1: { type: String, required: true, trim: true },
      areaOrLocality: { type: String, required: true, trim: true },
      cityOrDistrict: { type: String, required: true, trim: true },
      stateOrDivision: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      countryCode: { type: String, required: true, uppercase: true, trim: true },
      postalCode: { type: String, trim: true },
      timezone: { type: String, default: "UTC", trim: true },
    },
    coverImage: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    contact: {
      phone: { type: String, trim: true },
      email: { type: String, trim: true },
      website: { type: String, trim: true },
      socialLinks: {
        facebook: { type: String, trim: true },
        instagram: { type: String, trim: true },
        youtube: { type: String, trim: true },
      },
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["DRAFT", "PENDING", "APPROVED", "REJECTED", "SUSPENDED", "ARCHIVED"],
      default: "PENDING",
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ["UNVERIFIED", "VERIFIED", "OFFICIAL"],
      default: "UNVERIFIED",
    },
    duplicateCheckStatus: {
      type: String,
      enum: ["UNIQUE", "POTENTIAL_DUPLICATE", "RESOLVED"],
      default: "UNIQUE",
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    favoriteCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for global geospatial and text searches
MandapSchema.index({ location: "2dsphere" });
MandapSchema.index({ "address.country": 1, "address.cityOrDistrict": 1, status: 1 });
MandapSchema.index({
  name: "text",
  "address.cityOrDistrict": "text",
  "address.areaOrLocality": "text",
});

export const Mandap = mongoose.model("Mandap", MandapSchema);
