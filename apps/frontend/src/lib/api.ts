const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
const API_KEY = import.meta.env.VITE_API_KEY

if (!API_KEY && import.meta.env.DEV) {
  console.warn(
    '[API] VITE_API_KEY가 설정되지 않았습니다. API 호출이 실패할 수 있습니다.'
  )
}

interface UploadResponse {
  success: boolean
  data?: { documentId: string }
  message?: string
}

function getHeaders(): HeadersInit {
  return {
    'api-key': API_KEY || '',
  }
}

export async function uploadDocument(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${BASE_URL}/documents`, {
    method: 'POST',
    headers: getHeaders(),
    body: formData,
  })

  const data: UploadResponse = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || '업로드에 실패했습니다.')
  }

  if (!data.data || !data.data.documentId) {
    throw new Error('서버 응답 형식이 올바르지 않습니다.')
  }

  return data.data.documentId
}
