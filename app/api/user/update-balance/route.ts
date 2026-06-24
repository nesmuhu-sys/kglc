import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User, Level, Wallet, Transaction } from '@/lib/models'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
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

    const user = await User.findById(decoded.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const level = await Level.findOne({ level: user.level })
    if (!level) {
      return NextResponse.json({ error: 'No active level. Please buy a level.' }, { status: 400 })
    }

    const dailyTasks = level.dailyTasks
    const dailyEarning = level.price * level.dailyReturn / 100
    const perTaskReward = dailyTasks > 0 ? Math.floor(dailyEarning / dailyTasks) : 0

    // Daily reset – YYYY-MM-DD in Rwandan time
    const now = new Date()
    const kigaliDate = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Kigali' }))
    const today = kigaliDate.toISOString().split('T')[0]

    let needsReset = false
    if (!user.lastTaskResetDate) {
      user.lastTaskResetDate = today
      user.dailyTasksCompleted = 0
      needsReset = true
    } else if (user.lastTaskResetDate !== today) {
      user.lastTaskResetDate = today
      user.dailyTasksCompleted = 0
      needsReset = true
    }

    if (needsReset) {
      await user.save()
      console.log('🔄 Daily reset in update-balance')
    }

    const completed = user.dailyTasksCompleted || 0
    if (completed >= dailyTasks) {
      return NextResponse.json({ error: 'Daily task limit reached' }, { status: 400 })
    }

    const amount = perTaskReward
    const balanceBefore = user.balance
    user.balance += amount
    user.totalEarned = (user.totalEarned || 0) + amount
    user.dailyTasksCompleted = completed + 1
    await user.save()

    // Update wallet
    const wallet = await Wallet.findOne({ userId: user._id })
    if (wallet) {
      wallet.balance = user.balance
      await wallet.save()
    }

    await Transaction.create({
      userId: user._id,
      type: 'task_earning',
      amount,
      balanceBefore,
      balanceAfter: user.balance,
      description: `Task earning from Level ${user.level}`,
      status: 'completed',
    })

    const tasksRemaining = dailyTasks - user.dailyTasksCompleted

    return NextResponse.json({
      success: true,
      balance: user.balance,
      totalEarned: user.totalEarned,
      dailyTasksRemaining: tasksRemaining,
    })
  } catch (error: any) {
    console.error('Update balance error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}