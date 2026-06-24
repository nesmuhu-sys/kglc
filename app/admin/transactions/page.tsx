'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminTransactions() {
  const router = useRouter()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/'); return }
    fetch('/api/admin/transactions', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) setTransactions(data.transactions)
        setLoading(false)
      })
      .catch(() => router.push('/'))
  }, [])

  // We need an API endpoint for /api/admin/transactions – we'll add it.

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">All Transactions</h1>
      {/* ... table similar to withdrawals */}
    </div>
  )
}