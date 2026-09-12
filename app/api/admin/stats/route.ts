import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User, Transaction } from '@/lib/models'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const admin = await User.findById(decoded.id)
    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const totalUsers = await User.countDocuments()
    const pendingWithdrawals = await Transaction.countDocuments({ type: 'withdrawal', status: 'pending' })
    const totalDeposits = await Transaction.countDocuments({ type: 'deposit', status: 'completed' })

    const depositAgg = await Transaction.aggregate([
      { $match: { type: 'deposit', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
    const withdrawalAgg = await Transaction.aggregate([
      { $match: { type: 'withdrawal', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        pendingWithdrawals,
        totalDeposits,
        totalDepositsAmount: depositAgg[0]?.total || 0,
        totalWithdrawalsAmount: withdrawalAgg[0]?.total || 0,
      }
    })
  } catch (error: any) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
