import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Level, User, Wallet, Transaction } from '@/lib/models'
import { verifyToken } from '@/lib/auth'

// GET - Fetch all active levels
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const levels = await Level.find({ isActive: true }).sort({ level: 1 })
    return NextResponse.json({ success: true, levels })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Buy a level
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

    const { levelNumber } = await request.json()
    if (!levelNumber) {
      return NextResponse.json({ error: 'Level number required' }, { status: 400 })
    }

    // Find the level
    const level = await Level.findOne({ level: levelNumber, isActive: true })
    if (!level) {
      return NextResponse.json({ error: 'Level not found or inactive' }, { status: 404 })
    }

    // Get user
    const user = await User.findById(decoded.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check balance
    if (user.balance < level.price) {
      return NextResponse.json({ 
        error: `Insufficient balance. Need ${level.price} RWF, have ${user.balance} RWF` 
      }, { status: 400 })
    }

    // Deduct balance
    const newBalance = user.balance - level.price
    const balanceBefore = user.balance
    
    // Update user
    user.balance = newBalance
    user.level = level.level
    user.isActive = true
    // Set expiry: now + durationDays
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + level.durationDays)
    user.levelExpiry = expiryDate
    user.totalEarned = user.totalEarned || 0
    user.totalWithdrawn = user.totalWithdrawn || 0
    user.activeLevelsCount = (user.activeLevelsCount || 0) + 1

    // Reset daily tasks for the new level
    const today = new Date().toLocaleDateString('en-US', { timeZone: 'Africa/Kigali' })
    user.dailyTasksCompleted = 0
    user.lastTaskResetDate = today

    await user.save()

    // Update wallet
    const wallet = await Wallet.findOne({ userId: user._id })
    if (wallet) {
      wallet.balance = newBalance
      await wallet.save()
    }

    // Create transaction record
    await Transaction.create({
      userId: user._id,
      type: 'level_purchase',
      amount: level.price,
      balanceBefore,
      balanceAfter: newBalance,
      description: `Purchased Level ${level.level} (${level.displayName}) for ${level.price} RWF`,
      status: 'completed',
      reference: `level-${level.level}-${Date.now()}`
    })

    // Compute per-task reward for the new level
    const dailyTasks = level.dailyTasks
    const dailyEarning = level.price * level.dailyReturn / 100
    const perTaskReward = dailyTasks > 0 ? Math.floor(dailyEarning / dailyTasks) : 0

    // Return updated user data
    return NextResponse.json({
      success: true,
      message: `Level ${level.level} purchased successfully!`,
      user: {
        level: user.level,
        balance: user.balance,
        isActive: user.isActive,
        levelExpiry: user.levelExpiry,
        dailyLimit: dailyTasks,
        dailyTasksRemaining: dailyTasks, // since we reset to 0, all tasks available
        perTaskReward,
        spinsAvailable: user.spinsAvailable || 0,
      }
    })

  } catch (error: any) {
    console.error('Buy level error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}