import OpenAI from "openai";
import { PARSING_ERRORS } from "../constants/errors.js";

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const TIMEOUT_MS = 30000;

const SYSTEM_PROMPT = `당신은 한국 세금계산서/영수증에서 정보를 추출하는 전문가입니다.

아래 텍스트에서 다음 5개 필드를 추출하세요:
1. issueDate: 발행일 (YYYY-MM-DD 형식)
2. supplierRegNo: 공급자 사업자등록번호 (000-00-00000 형식)
3. supplyAmount: 공급가액 (정수)
4. vatAmount: 부가세액 (정수)
5. totalAmount: 합계금액 (정수)

규칙:
- 찾을 수 없는 필드는 null로 반환
- 금액은 반드시 정수로 반환 (문자열 아님)
- JSON 형식으로만 응답`;

let openaiClient = null;

function getOpenAIClient() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;
    openaiClient = new OpenAI({ apiKey, timeout: TIMEOUT_MS });
  }
  return openaiClient;
}

function normalizeAmount(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[,원₩\s]/g, "");
    const num = Number(cleaned);
    return Number.isNaN(num) ? null : num;
  }
  return null;
}

function isCompleteResult(result) {
  return Object.values(result).every(v => v !== null);
}

export async function parseInvoiceFields(text) {
  if (!text || typeof text !== "string" || text.trim() === "") {
    return { success: false, result: null, model: null, error: PARSING_ERRORS.EMPTY_TEXT };
  }

  const openai = getOpenAIClient();
  if (!openai) {
    return { success: false, result: null, model: null, error: PARSING_ERRORS.API_KEY_MISSING };
  }

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text }
      ]
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { success: false, result: null, model: MODEL, error: PARSING_ERRORS.INVALID_LLM_OUTPUT };
    }

    let llmOutput;
    try {
      llmOutput = JSON.parse(content);
    } catch {
      return { success: false, result: null, model: MODEL, error: PARSING_ERRORS.INVALID_LLM_OUTPUT };
    }

    const result = {
      issueDate: llmOutput.issueDate ?? null,
      supplierRegNo: llmOutput.supplierRegNo ?? null,
      supplyAmount: normalizeAmount(llmOutput.supplyAmount),
      vatAmount: normalizeAmount(llmOutput.vatAmount),
      totalAmount: normalizeAmount(llmOutput.totalAmount)
    };

    const success = isCompleteResult(result);

    return {
      success,
      result,
      model: MODEL,
      error: success ? undefined : PARSING_ERRORS.INCOMPLETE_FIELDS
    };
  } catch (err) {
    console.error(err);
    return { success: false, result: null, model: MODEL, error: PARSING_ERRORS.LLM_REQUEST_FAILED };
  }
}
