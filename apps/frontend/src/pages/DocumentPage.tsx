import { useParams, useNavigate } from 'react-router-dom'
import { FileText, Clock, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const INITIAL_STATUS = 'UPLOADED'
const INITIAL_STEP = 'TEXT_EXTRACTION'

const TEXT = {
  title: '문서 처리 현황',
  stepsTitle: '처리 단계',
  failureTitle: '처리 실패 시',
  failureDesc: '일부 단계가 실패하더라도 재시도가 가능합니다. 문제가 지속되면 다른 파일로 다시 시도해주세요.',
  newUpload: '새 문서 업로드',
}

const STEPS = [
  { id: 'TEXT_EXTRACTION', label: 'PDF 텍스트 추출' },
  { id: 'OCR_PROCESSING', label: 'OCR 처리' },
  { id: 'LLM_PARSING', label: 'LLM 필드 파싱' },
]

const STATUS_MAP = {
  UPLOADED: { label: '업로드 완료', variant: 'secondary' as const },
  PROCESSING: { label: '처리 중', variant: 'default' as const },
  DONE: { label: '완료', variant: 'default' as const },
  FAILED: { label: '실패', variant: 'destructive' as const },
}

function getStepStatus(stepId: string, currentStep: string) {
  const stepOrder = STEPS.map((s) => s.id)
  const currentIndex = stepOrder.indexOf(currentStep)
  const stepIndex = stepOrder.indexOf(stepId)

  if (stepIndex < currentIndex) return 'done'
  if (stepIndex === currentIndex) return 'current'
  return 'pending'
}

export function DocumentPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const statusInfo = STATUS_MAP[INITIAL_STATUS]

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{TEXT.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">ID: {id}</p>
          </div>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{TEXT.stepsTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {STEPS.map((step) => {
              const status = getStepStatus(step.id, INITIAL_STEP)
              return (
                <div key={step.id} className="flex items-center gap-4">
                  <div className="shrink-0">
                    {status === 'done' && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    {status === 'current' && (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    )}
                    {status === 'pending' && (
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <span
                    className={
                      status === 'pending'
                        ? 'text-muted-foreground'
                        : 'text-foreground'
                    }
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-muted">
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm text-foreground font-medium">{TEXT.failureTitle}</p>
                <p className="text-sm text-muted-foreground">{TEXT.failureDesc}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="cursor-pointer hover:bg-accent hover:scale-[1.02] transition-all"
          >
            {TEXT.newUpload}
          </Button>
        </div>
      </div>
    </div>
  )
}
