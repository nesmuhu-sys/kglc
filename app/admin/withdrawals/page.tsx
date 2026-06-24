'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Clock, AlertCircle, Loader2 } from 'lucide-react'

export default function AdminWithdrawals() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [selected, setSelected] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')

  const fetchWithdrawals = async (status = statusFilter) => {
    const token = localStorage.getItem('token')
    const res = await fetch(`/api/admin/withdrawals?status=${status}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    if (data.success) {
      setWithdrawals(data.withdrawals)
    }
    setLoading(false)
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/'); return }
    // Check admin
    fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (!data.user?.isAdmin) {
          router.push('/dashboard')
          return
        }
        fetchWithdrawals()
      })
      .catch(() => router.push('/'))
  }, [])

  const handleAction = async (transactionId: string, action: string) => {
    setActionLoading(true)
    const token = localStorage.getItem('token')
    const res = await fetch('/api/admin/withdrawals', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        transactionId,
        action,
        adminNotes: adminNotes || `${action}ed by admin`
      })
    })
    const data = await res.json()
    if (data.success) {
      // Refresh list
      fetchWithdrawals(statusFilter)
      setSelected(null)
      setAdminNotes('')
    } else {
      alert(data.error || 'Action failed')
    }
    setActionLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Withdrawal Requests</h1>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex gap-2">
            {['pending', 'approved', 'completed', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status)
                  fetchWithdrawals(status)
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : withdrawals.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No {statusFilter} withdrawals</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {withdrawals.map((w: any) => (
                  <tr key={w._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{w.userId?.name}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{w.amount} RWF</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{w.userId?.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{w.fee} RWF</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{w.netAmount} RWF</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(w.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        w.status === 'completed' ? 'bg-green-100 text-green-700' :
                        w.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        w.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {w.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelected(w)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Review
                          </button>
                        </div>
                      )}
                      {w.status === 'approved' && (
                        <button
                          onClick={() => handleAction(w._id, 'complete')}
                          disabled={actionLoading}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Mark as Sent
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Review Withdrawal</h2>
            <div className="space-y-2 mb-4">
              <p><strong>User:</strong> {selected.userId?.name}</p>
              <p><strong>Amount:</strong> {selected.amount} RWF</p>
              <p><strong>Phone:</strong> {selected.userId?.phone}</p>
              <p><strong>Net Amount:</strong> {selected.netAmount} RWF</p>
              <p><strong>Fee:</strong> {selected.fee} RWF</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                rows={3}
                placeholder="Add notes (optional)"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleAction(selected._id, 'approve')}
                disabled={actionLoading}
                className="flex-1 bg-blue-600 text-white rounded-xl py-2 hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Approve
              </button>
              <button
                onClick={() => handleAction(selected._id, 'reject')}
                disabled={actionLoading}
                className="flex-1 bg-red-600 text-white rounded-xl py-2 hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Reject
              </button>
              <button
                onClick={() => { setSelected(null); setAdminNotes('') }}
                className="flex-1 bg-gray-200 text-gray-700 rounded-xl py-2 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}