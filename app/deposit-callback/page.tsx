import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import DepositCallbackContent from './DepositCallbackContent'

export default function DepositCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Loading...</h2>
        </div>
      </div>
    }>
      <DepositCallbackContent />
    </Suspense>
  )
}