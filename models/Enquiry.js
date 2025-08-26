import mongoose, { Schema } from "mongoose";

const EnquirySchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    interest: { type: String },
    batch_time: { type: String, required: true },
    academyId: { type: String, required: true },
    academyName: { type: String, required: true },
    type: { type: String, required: true }, // e.g., "Art" or "Sports"
    // programId removed as per requirement
    programName: { type: String, required: true },
    message: { type: String }, // optional user message
  },
  {
    timestamps: true,
    collection: "enquiries",
  }
);

export default mongoose.models.Enquiry || mongoose.model("Enquiry", EnquirySchema);