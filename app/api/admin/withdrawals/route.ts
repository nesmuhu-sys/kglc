import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Transaction, User } from '@/lib/models'
import { verifyToken } from '@/lib/auth'

// GET all withdrawals (with optional status filter)
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const admin = await User.findById(decoded.id)
    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'

    const withdrawals = await Transaction.find({ type: 'withdrawal', status })
      .populate('userId', 'name phone balance')
      .sort({ createdAt: -1 })

    return NextResponse.json({ success: true, withdrawals })
  } catch (error: any) {
    console.error('Admin withdrawals error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT – approve or reject a withdrawal
export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const admin = await User.findById(decoded.id)
    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { transactionId, action, adminNotes } = body

    if (!transactionId || !action) {
      return NextResponse.json({ error: 'Transaction ID and action required' }, { status: 400 })
    }

    const transaction = await Transaction.findById(transactionId)
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    if (transaction.status !== 'pending') {
      return NextResponse.json({ error: 'Transaction already processed' }, { status: 400 })
    }

    if (action === 'approve') {
      // Mark as approved, but not yet completed (admin will send funds later)
      transaction.status = 'approved'
      transaction.metadata.admin_notes = adminNotes || 'Approved by admin'
      transaction.metadata.approved_at = new Date()
      await transaction.save()

      // We do NOT deduct balance here because it was already deducted when the withdrawal was requested.
      // But we should ensure balance is correct (already deducted).
    } else if (action === 'reject') {
      // Reject: return the funds to user
      transaction.status = 'rejected'
      transaction.metadata.admin_notes = adminNotes || 'Rejected by admin'
      transaction.metadata.rejected_at = new Date()
      await transaction.save()

      // Refund the user
      const user = await User.findById(transaction.userId)
      if (user) {
        user.balance += transaction.amount
        await user.save()
        // Update transaction balanceAfter
        transaction.balanceAfter = user.balance
        await transaction.save()
      }
    } else if (action === 'complete') {
      // After admin sends funds manually
      transaction.status = 'completed'
      transaction.metadata.admin_notes = adminNotes || 'Funds sent'
      transaction.metadata.completed_at = new Date()
      await transaction.save()
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Withdrawal ${action}ed successfully`,
      transaction,
    })
  } catch (error: any) {
    console.error('Admin withdrawal action error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}