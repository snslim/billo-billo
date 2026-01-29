import {
  PIPELINE_STEPS,
  PIPELINE_STATUS,
  EXTRACTION_STATUS,
  EXTRACTION_METHOD,
  PARSING_STATUS,
  EVENT_ACTIONS
} from "../constants/pipeline.js";
import { PROCESS_ERRORS } from "../constants/errors.js";
import { extractPdfText } from "./extractPdfText.js";
import { extractOcrText } from "./extractOcrText.js";
import { detectSignals } from "./detectSignals.js";

export const SUPPORTED_MIME_TYPES = {
  "application/pdf": { step: PIPELINE_STEPS.PDF_TEXT_EXTRACT, method: EXTRACTION_METHOD.PDF_TEXT },
  "image/png": { step: PIPELINE_STEPS.OCR_EXTRACT, method: EXTRACTION_METHOD.OCR },
  "image/jpeg": { step: PIPELINE_STEPS.OCR_EXTRACT, method: EXTRACTION_METHOD.OCR }
};

export const MIN_SIGNALS = 1;
export const MIN_TEXT_LENGTH = 200;
export const MAX_PARSING_ATTEMPTS = 3;

export function pushEvent(doc, { step, action, reason }) {
  if (!doc.events) {
    doc.events = [];
  }
  doc.events.push({
    step,
    action,
    reason: reason || null,
    timestamp: new Date()
  });
}

export function isTextSufficient(signals, text) {
  return signals.length >= MIN_SIGNALS && text.length >= MIN_TEXT_LENGTH;
}

export function getEmptyParsingResult() {
  return {
    issueDate: null,
    supplierRegNo: null,
    supplyAmount: null,
    vatAmount: null,
    totalAmount: null
  };
}

export async function runExtraction(doc, filePath, mimeType) {
  const config = SUPPORTED_MIME_TYPES[mimeType];
  const isPdf = mimeType === "application/pdf";

  doc.pipeline.currentStep = config.step;
  pushEvent(doc, { step: config.step, action: EVENT_ACTIONS.START });

  const result = isPdf
    ? await extractPdfText(filePath)
    : await extractOcrText(filePath);

  if (!result.success) {
    doc.extraction = {
      status: EXTRACTION_STATUS.FAILED,
      method: config.method,
      text: null,
      meta: { signals: [], reason: result.error }
    };
    doc.pipeline.overallStatus = PIPELINE_STATUS.FAILED;
    pushEvent(doc, { step: config.step, action: EVENT_ACTIONS.FAILED, reason: result.error });
    return { success: false, error: result.error };
  }

  const signalResult = detectSignals(result.text);

  doc.extraction = {
    status: EXTRACTION_STATUS.SUCCESS,
    method: config.method,
    text: result.text,
    meta: { signals: signalResult.signals, reason: null }
  };
  pushEvent(doc, { step: config.step, action: EVENT_ACTIONS.SUCCESS });

  return {
    success: true,
    text: result.text,
    signals: signalResult.signals,
    isPdf
  };
}

export function handleInsufficientText(doc, isPdf) {
  if (isPdf) {
    pushEvent(doc, { step: PIPELINE_STEPS.OCR_EXTRACT, action: EVENT_ACTIONS.SKIPPED, reason: "PDF OCR 미지원" });
  }
  pushEvent(doc, { step: PIPELINE_STEPS.LLM_PARSE, action: EVENT_ACTIONS.START });
  pushEvent(doc, { step: PIPELINE_STEPS.LLM_PARSE, action: EVENT_ACTIONS.FAILED, reason: PROCESS_ERRORS.EXTRACTION_TEXT_INSUFFICIENT });

  doc.parsing = {
    status: PARSING_STATUS.FAILED,
    attempts: doc.parsing.attempts,
    maxAttempts: MAX_PARSING_ATTEMPTS,
    result: getEmptyParsingResult(),
    meta: { reason: PROCESS_ERRORS.EXTRACTION_TEXT_INSUFFICIENT, model: null }
  };
  doc.pipeline.overallStatus = PIPELINE_STATUS.FAILED;
}
