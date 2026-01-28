import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { uploadDocument } from '@/lib/api'
import { UPLOAD_ERRORS } from '@/constants/errors'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg']

const TEXT = {
  header: {
    title: '세금계산서 검증 시스템',
    subtitle: 'AI 기반 데이터 추출과 결정론적 규칙 기반 검증',
  },
  howItWorks: {
    title: '시스템 작동 방식',
    description: '이 시스템은 자동 의사결정 도구가 아닌 검증 보조 도구입니다',
  },
  upload: {
    dropText: '여기에 세금계산서를 드롭하세요',
    selectText: '또는 클릭하여 파일 선택',
    selectButton: '파일 선택',
    changeFileButton: '다른 파일 선택',
    uploadButton: '업로드',
    uploadingButton: '업로드 중...',
    sampleButton: '샘플 세금계산서 사용',
    sampleDesc: '미리 구성된 샘플을 로드하여 시스템을 탐색할 수 있습니다',
  },
  info: {
    supportedTitle: '지원 형식',
    supportedDesc: 'PDF 문서, PNG/JPG/JPEG 이미지',
    limitsTitle: '제한사항',
    limitsDesc: '최대 10MB. 수기 문서는 정확도가 낮을 수 있음',
  },
}

const steps = [
  {
    num: 1,
    title: 'AI가 데이터 추출',
    desc: 'AI가 문서를 읽고 주요 필드를 추출합니다.',
  },
  {
    num: 2,
    title: '사용자가 검토 및 수정',
    desc: '추출된 값을 검토하고 오류를 수정합니다.',
  },
  {
    num: 3,
    title: '규칙이 검증',
    desc: '결정론적 코드 기반 규칙이 최종 검증 결정을 내립니다.',
  },
]

export function UploadPage() {
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    const file = files && files.length > 0 ? files[0] : null
    setSelectedFile(file)
    setErrorMessage('')
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0] || null
    setSelectedFile(file)
    setErrorMessage('')
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage(UPLOAD_ERRORS.FILE_REQUIRED)
      return
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setErrorMessage(UPLOAD_ERRORS.FILE_TOO_LARGE)
      return
    }

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setErrorMessage(UPLOAD_ERRORS.UNSUPPORTED_TYPE)
      return
    }

    setIsUploading(true)
    setErrorMessage('')

    try {
      const documentId = await uploadDocument(selectedFile)
      navigate(`/documents/${documentId}`)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : UPLOAD_ERRORS.UPLOAD_FAILED
      )
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">
            {TEXT.header.title}
          </h1>
          <p className="text-muted-foreground">{TEXT.header.subtitle}</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{TEXT.howItWorks.title}</CardTitle>
            <CardDescription>{TEXT.howItWorks.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {steps.map((step) => (
                <div key={step.num} className="flex flex-col items-center text-center gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    {step.num}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            {!selectedFile ? (
              <div
                role="button"
                tabIndex={0}
                className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onKeyDown={(e) =>
                  e.key === 'Enter' &&
                  document.getElementById('file-input')?.click()
                }
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {TEXT.upload.dropText}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {TEXT.upload.selectText}
                </p>
                <input
                  type="file"
                  id="file-input"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                />
                <Button
                  variant="outline"
                  className="cursor-pointer hover:bg-accent hover:scale-[1.02] transition-all"
                  onClick={(e) => {
                    e.stopPropagation()
                    document.getElementById('file-input')?.click()
                  }}
                >
                  {TEXT.upload.selectButton}
                </Button>
              </div>
            ) : (
              <div className="border-2 border-solid border-border rounded-lg p-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 cursor-pointer hover:bg-accent hover:scale-[1.02] transition-all"
                  onClick={() => setSelectedFile(null)}
                >
                  {TEXT.upload.changeFileButton}
                </Button>
              </div>
            )}

            {errorMessage && (
              <p className="text-sm text-destructive text-center mt-4">
                {errorMessage}
              </p>
            )}

            <div className="text-center mt-6">
              <Button
                variant="outline"
                onClick={handleUpload}
                disabled={isUploading || !selectedFile}
                className="gap-2 cursor-pointer bg-neutral-500 text-white border-neutral-500 hover:bg-neutral-700 hover:border-neutral-700 hover:text-white hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:border-border disabled:hover:scale-100"
              >
                <Upload className="w-4 h-4" />
                {isUploading
                  ? TEXT.upload.uploadingButton
                  : TEXT.upload.uploadButton}
              </Button>
            </div>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">또는</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="text-center">
              <Button variant="secondary" className="gap-2 cursor-pointer hover:bg-neutral-300 hover:scale-[1.02] transition-all">
                <FileText className="w-4 h-4" />
                {TEXT.upload.sampleButton}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                {TEXT.upload.sampleDesc}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-muted">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 justify-center items-start">
              <div className="text-center w-full md:w-80">
                <h4 className="text-base font-medium text-foreground mb-2 flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  {TEXT.info.supportedTitle}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {TEXT.info.supportedDesc}
                </p>
              </div>
              <div className="text-center w-full md:w-80">
                <h4 className="text-base font-medium text-foreground mb-2 flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  {TEXT.info.limitsTitle}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {TEXT.info.limitsDesc}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
