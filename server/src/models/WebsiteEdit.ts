import mongoose from "mongoose";

const websiteEditSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    domain: {
      type: String,
      required: false,
    },
    contentEdits: {
      type: Map,
      of: String,
      default: {},
    },
    isLive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

export default mongoose.model("WebsiteEdit", websiteEditSchema);
