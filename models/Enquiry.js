import mongoose, { Schema } from "mongoose";

const EnquirySchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    interest: { type: String, required: true },
    batch_time: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: "enquiries",
  }
);

export default mongoose.models.Enquiry || mongoose.model("Enquiry", EnquirySchema);