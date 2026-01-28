import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  file: {
    storagePath: { type: String, required: true },
    mimeType: { type: String, required: true },
    pageCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
  },
  pipeline: {
    overallStatus: {
      type: String,
      enum: ["UPLOADED", "PROCESSING", "DONE", "FAILED"],
      default: "UPLOADED"
    },
    currentStep: {
      type: String,
      enum: ["TEXT_EXTRACTION", "OCR_PROCESSING", "LLM_PARSING"],
      default: "TEXT_EXTRACTION"
    }
  },
  extraction: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  parsing: {
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    status: { type: String, default: null },
    result: { type: mongoose.Schema.Types.Mixed, default: null },
    meta: {
      reason: { type: String, default: null }
    }
  },
  events: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  }
});

export default mongoose.model("Document", documentSchema);
