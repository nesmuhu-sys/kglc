'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function DepositCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [message, setMessage] = useState('Verifying your payment...')
  const reference = searchParams.get('reference')

  useEffect(() => {
    if (!reference) {
      setStatus('failed')
      setMessage('No reference provided')
      return
    }

    let attempts = 0
    const maxAttempts = 40

    const interval = setInterval(async () => {
      attempts++
      try {
        const res = await fetch(`/api/deposit/verify?reference=${reference}`)
        const data = await res.json()

        if (data.status === 'completed') {
          clearInterval(interval)
          setStatus('success')
          setMessage('Payment successful! Your balance has been updated.')
          setTimeout(() => router.push('/dashboard'), 3000)
        } else if (data.status === 'failed') {
          clearInterval(interval)
          setStatus('failed')
          setMessage('Payment failed. Please try again.')
          setTimeout(() => router.push('/dashboard'), 3000)
        } else if (attempts >= maxAttempts) {
          clearInterval(interval)
          setStatus('failed')
          setMessage('Payment verification timeout.')
          setTimeout(() => router.push('/dashboard'), 3000)
        }
      } catch {
        // continue polling
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [reference, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">Processing Payment</h2>
            <p className="text-gray-500 mt-2">{message}</p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">Payment Successful! 🎉</h2>
            <p className="text-gray-500 mt-2">{message}</p>
          </>
        )}
        {status === 'failed' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">Payment Failed</h2>
            <p className="text-gray-500 mt-2">{message}</p>
            <button onClick={() => router.push('/dashboard')} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  )
}