import mongoose from "mongoose";
import {
  PIPELINE_STEPS,
  PIPELINE_STATUS,
  EXTRACTION_STATUS,
  EXTRACTION_METHOD,
  PARSING_STATUS,
  SIGNALS
} from "../constants/pipeline.js";

const documentSchema = new mongoose.Schema(
  {
    file: {
      storagePath: { type: String, required: true },
      mimeType: { type: String, required: true },
      pageCount: { type: Number, default: 0 },
      uploadedAt: { type: Date, default: Date.now }
    },
    pipeline: {
      overallStatus: {
        type: String,
        enum: Object.values(PIPELINE_STATUS),
        default: PIPELINE_STATUS.UPLOADED
      },
      currentStep: {
        type: String,
        enum: Object.values(PIPELINE_STEPS),
        default: null
      }
    },
    extraction: {
      status: {
        type: String,
        enum: Object.values(EXTRACTION_STATUS),
        default: null
      },
      method: {
        type: String,
        enum: Object.values(EXTRACTION_METHOD),
        default: null
      },
      text: { type: String, default: null },
      meta: {
        signals: {
          type: [{ type: String, enum: Object.values(SIGNALS) }],
          default: []
        },
        reason: { type: String, default: null }
      }
    },
    parsing: {
      status: {
        type: String,
        enum: Object.values(PARSING_STATUS),
        default: null
      },
      attempts: { type: Number, default: 0 },
      maxAttempts: { type: Number, default: 3 },
      result: {
        issueDate: { type: String, default: null },
        supplierRegNo: { type: String, default: null },
        supplyAmount: { type: Number, default: null },
        vatAmount: { type: Number, default: null },
        totalAmount: { type: Number, default: null }
      },
      meta: {
        reason: { type: String, default: null },
        model: { type: String, default: null }
      }
    },
    events: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Document", documentSchema);
