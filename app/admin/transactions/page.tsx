'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, Clock3, Loader2, XCircle } from 'lucide-react'

const statusOptions = ['all', 'pending', 'approved', 'completed', 'rejected', 'failed']

export default function AdminTransactions() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    fetch('/api/admin/transactions', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setTransactions(data.transactions || [])
        }
      })
      .catch(() => {
        router.push('/')
      })
      .finally(() => setLoading(false))
  }, [router])

  const filteredTransactions = useMemo(() => {
    if (selectedStatus === 'all') return transactions
    return transactions.filter((tx) => (tx.status || 'completed') === selectedStatus)
  }, [transactions, selectedStatus])

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">All Transactions</h1>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Clock3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No {selectedStatus === 'all' ? 'transactions' : selectedStatus} records</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTransactions.map((tx: any) => (
                    <tr key={tx._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{tx.userId?.name || 'Unknown user'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {tx.type || tx.kind || 'Deposit'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {Number(tx.amount || 0).toLocaleString()} RWF
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{tx.userId?.phone || '—'}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            tx.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : tx.status === 'approved'
                              ? 'bg-blue-100 text-blue-700'
                              : tx.status === 'rejected' || tx.status === 'failed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {tx.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                          {tx.status === 'rejected' || tx.status === 'failed' ? <XCircle className="w-3.5 h-3.5" /> : null}
                          {tx.status === 'pending' || tx.status === 'approved' ? <Clock3 className="w-3.5 h-3.5" /> : null}
                          {tx.status || 'completed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}