export const UPLOAD_ERRORS = {
  UNSUPPORTED_TYPE: "지원하지 않는 파일 형식입니다",
  FILE_TOO_LARGE: "파일 크기가 10MB를 초과했습니다",
  UPLOAD_FAILED: "파일 업로드에 실패했습니다",
  FILE_REQUIRED: "파일이 필요합니다"
};

export const DOCUMENT_ERRORS = {
  NOT_FOUND: "문서를 찾을 수 없습니다",
  INVALID_ID: "유효하지 않은 문서 ID입니다"
};

export const AUTH_ERRORS = {
  UNAUTHORIZED: "인증이 필요합니다"
};

export const COMMON_ERRORS = {
  NOT_FOUND: "요청한 리소스를 찾을 수 없습니다",
  SERVER_ERROR: "서버 내부 오류가 발생했습니다",
  TOO_MANY_REQUESTS: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요"
};

export const EXTRACTION_ERRORS = {
  INVALID_FILE_PATH: "유효하지 않은 파일 경로입니다",
  FILE_NOT_FOUND: "파일을 찾을 수 없습니다",
  PDF_PARSE_ERROR: "PDF 파싱에 실패했습니다",
  OCR_ENGINE_ERROR: "OCR 처리에 실패했습니다"
};

export const PARSING_ERRORS = {
  EMPTY_TEXT: "파싱할 텍스트가 없습니다",
  API_KEY_MISSING: "OpenAI API 키가 설정되지 않았습니다",
  LLM_REQUEST_FAILED: "LLM 요청에 실패했습니다",
  INVALID_LLM_OUTPUT: "LLM 응답을 파싱할 수 없습니다",
  INCOMPLETE_FIELDS: "일부 필드를 추출하지 못했습니다"
};

export const PROCESS_ERRORS = {
  ALREADY_PROCESSED: "이미 처리된 문서입니다. 재처리하려면 force=true를 전달하세요.",
  MAX_ATTEMPTS_EXCEEDED: "최대 파싱 시도 횟수를 초과했습니다",
  UNSUPPORTED_FILE_TYPE: "지원하지 않는 파일 형식입니다",
  EXTRACTION_TEXT_INSUFFICIENT: "추출된 텍스트가 충분하지 않습니다"
};
