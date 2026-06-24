'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/'); return }
    fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (!data.user?.isAdmin) {
          router.push('/dashboard')
        } else {
          setIsAdmin(true)
        }
      })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false))
  }, [router])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo1.png" alt="KGLC" className="w-8 h-8" />
          <span className="font-bold text-gray-900">KGLC Admin</span>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('token')
            router.push('/')
          }}
          className="text-sm text-gray-600 hover:text-red-600"
        >
          Logout
        </button>
      </nav>
      <div className="flex">
        <aside className="w-48 bg-white shadow-sm min-h-screen p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                📊 Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => router.push('/admin/withdrawals')}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                💸 Withdrawals
              </button>
            </li>
            <li>
              <button
                onClick={() => router.push('/admin/transactions')}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                📜 Transactions
              </button>
            </li>
          </ul>
        </aside>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}