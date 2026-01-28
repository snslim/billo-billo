import fs from "node:fs/promises";
import { PDFParse } from "pdf-parse";
import { EXTRACTION_ERRORS } from "../constants/errors.js";

export async function extractPdfText(filePath) {
  if (!filePath || typeof filePath !== "string") {
    return { success: false, text: "", error: EXTRACTION_ERRORS.INVALID_FILE_PATH };
  }

  try {
    await fs.access(filePath);
  } catch {
    return { success: false, text: "", error: EXTRACTION_ERRORS.FILE_NOT_FOUND };
  }

  try {
    const buffer = await fs.readFile(filePath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = (result.text || "").trim();
    return { success: true, text };
  } catch (err) {
    console.error(err);
    return { success: false, text: "", error: EXTRACTION_ERRORS.PDF_PARSE_ERROR };
  }
}
