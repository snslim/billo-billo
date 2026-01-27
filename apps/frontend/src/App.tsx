import { Routes, Route, Navigate } from 'react-router-dom'
import { UploadPage } from './pages/UploadPage'
import { DocumentPage } from './pages/DocumentPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<UploadPage />} />
      <Route path="/documents/:id" element={<DocumentPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
