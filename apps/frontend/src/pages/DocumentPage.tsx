import { useParams } from 'react-router-dom'

export function DocumentPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-foreground">문서 상태</h1>
        <p className="text-muted-foreground mt-2">Document ID: {id}</p>
      </div>
    </div>
  )
}
