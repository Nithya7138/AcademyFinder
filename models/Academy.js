
import mongoose, { Schema } from "mongoose";

//! Address Schema
const AddressSchema = new Schema({
  line1: { type: String, required: true },
  line2: { type: String, required: true },
  Area: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  zip: { type: String ,required:true},
  link: { type: String ,required:true}
});

//! Art Program Schema
const ArtProgramSchema = new Schema({
  art_name: { type: String, required: true },
  fees_per_month: { type: Number, min: 1000, max: 5000, default: 0 },
  level: { type: String, required: true }
}, { _id: false });

//! Sports Program Schema
const SportsProgramSchema = new Schema({
  sport_name: { type: String, required: true },
  fees_per_month: { type: Number, min: 1000, max: 5000, default: 0 },
  level: { type: String, required: true }
}, { _id: false });

//! Academy Data Schema
const AcademyDataSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Optional if you want a custom ID
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ["Art", "Sports"] },
  address: { type: AddressSchema, required: true },
  phone: { type: String, required: true },
  wabsite: { type: String, required: true },
  academy_startat: { type: Date, required: true },
  trainers: [{
    name: { type: String, required: true },
    experience: { type: Number, required: true },
    specialization: { type: String, required: true }
  }],
  achievements: { 
    award: { type: String },
    notable_alumni: { type: [String] },
    recognition: { type: String }
  },

  average_rating: { type: Number, min: 1, max: 5 },
  artprogram: [ArtProgramSchema],
  sportsprogram: [SportsProgramSchema],
  //! GeoJSON Point for nearby search (required)
  location: {
    type: { type: String, enum: ['Point'], default: 'Point', required: true },
    coordinates: { type: [Number], required: true } // [lng, lat]
  }
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  collection: "academydata" // ✅ Correct usage
});

//! Ensure geospatial index exists
AcademyDataSchema.index({ location: "2dsphere" });

//! Validate presence and format of coordinates
AcademyDataSchema.pre('validate', function(next) {
  const coords = this.location?.coordinates;
  if (!Array.isArray(coords) || coords.length !== 2) {
    this.invalidate('location', 'location.coordinates [lng, lat] is required');
  }
  next();
});

export default mongoose.models.Academydata || mongoose.model("Academydata", AcademyDataSchema);
