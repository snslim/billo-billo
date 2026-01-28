import fs from "node:fs/promises";
import Tesseract from "tesseract.js";
import { EXTRACTION_ERRORS } from "../constants/errors.js";

export async function extractOcrText(filePath) {
  if (!filePath || typeof filePath !== "string") {
    return { success: false, text: "", confidence: 0, error: EXTRACTION_ERRORS.INVALID_FILE_PATH };
  }

  try {
    await fs.access(filePath);
  } catch {
    return { success: false, text: "", confidence: 0, error: EXTRACTION_ERRORS.FILE_NOT_FOUND };
  }

  try {
    const result = await Tesseract.recognize(filePath, "kor");
    const text = (result.data.text || "").trim();
    const confidence = result.data.confidence;
    return { success: true, text, confidence };
  } catch (err) {
    console.error(err);
    return { success: false, text: "", confidence: 0, error: EXTRACTION_ERRORS.OCR_ENGINE_ERROR };
  }
}
