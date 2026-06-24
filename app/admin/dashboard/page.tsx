'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, DollarSign, Clock, TrendingUp, TrendingDown, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [recentWithdrawals, setRecentWithdrawals] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { 
      router.push('/')
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        // Check admin status
        const meRes = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const meData = await meRes.json()
        
        if (!meData.user?.isAdmin) {
          router.push('/dashboard')
          setLoading(false)
          return
        }

        // Fetch stats and withdrawals in parallel
        const [statsRes, withdrawalsRes] = await Promise.all([
          fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/admin/withdrawals?status=pending', { headers: { 'Authorization': `Bearer ${token}` } })
        ])

        const statsData = await statsRes.json()
        const withdrawalsData = await withdrawalsRes.json()

        if (statsData.success) setStats(statsData.stats)
        if (withdrawalsData.success) setRecentWithdrawals(withdrawalsData.withdrawals.slice(0, 5))
      } catch (error) {
        console.error('Error loading admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Withdrawals</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.pendingWithdrawals || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Deposits</p>
                <p className="text-2xl font-bold text-green-600">{stats?.totalDeposits || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-sm text-gray-400 mt-1">{stats?.totalDepositsAmount?.toLocaleString()} RWF</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Withdrawn</p>
                <p className="text-2xl font-bold text-red-600">{stats?.totalWithdrawalsAmount?.toLocaleString() || 0} RWF</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Recent Withdrawals */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Pending Withdrawals</h2>
            <button
              onClick={() => router.push('/admin/withdrawals')}
              className="text-sm text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>
          {recentWithdrawals.length === 0 ? (
            <p className="text-gray-500">No pending withdrawals</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentWithdrawals.map((w: any) => (
                    <tr key={w._id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{w.userId?.name}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{w.amount} RWF</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{w.userId?.phone}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(w.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => router.push(`/admin/withdrawals?action=${w._id}`)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}