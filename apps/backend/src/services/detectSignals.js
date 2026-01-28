import { SIGNALS } from "../constants/pipeline.js";

export function detectSignals(text) {
  if (!text || typeof text !== "string") {
    return { signals: [], isEnough: false };
  }

  const lowerText = text.toLowerCase();
  const detected = new Set();

  if (/\d{4}[-./]\d{2}[-./]\d{2}/.test(text)) {
    detected.add(SIGNALS.DATE);
  }

  if (/\d{3}-\d{2}-\d{5}/.test(text)) {
    detected.add(SIGNALS.REGNO);
  }

  if (/\d{1,3}(,\d{3})+/.test(text) || /₩\s*[\d,]+/.test(text) || /[\d,]+\s*원/.test(text)) {
    detected.add(SIGNALS.AMOUNT);
  }

  if (/부가세|세액|vat/.test(lowerText)) {
    detected.add(SIGNALS.VAT);
  }

  if (/세금계산서|영수증|invoice/.test(lowerText)) {
    detected.add(SIGNALS.DOC_TYPE);
  }

  const ordered = [
    SIGNALS.DATE,
    SIGNALS.REGNO,
    SIGNALS.AMOUNT,
    SIGNALS.VAT,
    SIGNALS.DOC_TYPE
  ].filter((sig) => detected.has(sig));

  return {
    signals: ordered,
    isEnough: ordered.length >= 2
  };
}
