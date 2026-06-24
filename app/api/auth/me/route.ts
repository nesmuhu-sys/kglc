import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User, Level } from '@/lib/models'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    await connectDB()
    const user = await User.findById(decoded.id).select('-password')
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const level = await Level.findOne({ level: user.level })
    const dailyTasks = level ? level.dailyTasks : 0
    const dailyEarning = level ? (level.price * level.dailyReturn / 100) : 0
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
      console.log('🔄 Daily reset in me route')
    }

    const completed = user.dailyTasksCompleted || 0
    const tasksRemaining = Math.max(0, dailyTasks - completed)

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        referralCode: user.referralCode,
        isActive: user.isActive,
        level: user.level,
        balance: user.balance,
        totalEarned: user.totalEarned,
        totalWithdrawn: user.totalWithdrawn,
        levelExpiry: user.levelExpiry,
        dailyTasksRemaining: tasksRemaining,
        dailyLimit: dailyTasks,
        perTaskReward,
        spinsAvailable: user.spinsAvailable || 0,
        referrals: user.referrals || { direct: 0, indirect: 0 },
        status: user.status,
      }
    })
  } catch (error: any) {
    console.error('Me error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}