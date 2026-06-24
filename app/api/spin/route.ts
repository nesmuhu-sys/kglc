import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User, Wallet, Transaction } from '@/lib/models'
import { verifyToken } from '@/lib/auth'

// Prize configuration with weights (higher weight = higher probability)
const PRIZES = [
  { id: 'thanks', label: 'Thanks', icon: '😊', value: 0, weight: 30, type: 'nothing' },
  { id: 'one_more', label: 'One More', icon: '🔄', value: 0, weight: 25, type: 'respino' },
  { id: '1k', label: '1K RWF', icon: '💰', value: 1000, weight: 20, type: 'cash' },
  { id: '5k', label: '5K RWF', icon: '💰', value: 5000, weight: 12, type: 'cash' },
  { id: 'bike', label: 'Bike', icon: '🚲', value: 0, weight: 8, type: 'prize' },
  { id: 'motorbike', label: 'Motorbike', icon: '🏍️', value: 0, weight: 4, type: 'prize' },
  { id: 'car', label: 'Car', icon: '🚗', value: 0, weight: 1, type: 'prize' },
]

// Total weight for normalization
const TOTAL_WEIGHT = PRIZES.reduce((sum, p) => sum + p.weight, 0)

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

    // Check if user has a spin available (from referrals)
    // We'll use a field `spinsAvailable` on user, default 0
    if (!user.spinsAvailable || user.spinsAvailable <= 0) {
      return NextResponse.json({ error: 'No spins available' }, { status: 400 })
    }

    // Pick a random prize based on weights
    let random = Math.random() * TOTAL_WEIGHT
    let selectedPrize = PRIZES[0]
    for (const prize of PRIZES) {
      random -= prize.weight
      if (random <= 0) {
        selectedPrize = prize
        break
      }
    }

    // Deduct one spin
    user.spinsAvailable -= 1
    await user.save()

    // Award prize
    let rewardMessage = ''
    let balanceAfter = user.balance

    if (selectedPrize.type === 'cash') {
      // Add to balance
      const amount = selectedPrize.value
      const balanceBefore = user.balance
      user.balance += amount
      user.totalEarned = (user.totalEarned || 0) + amount
      await user.save()

      // Update wallet if exists
      const wallet = await Wallet.findOne({ userId: user._id })
      if (wallet) {
        wallet.balance = user.balance
        await wallet.save()
      }

      // Create transaction
      await Transaction.create({
        userId: user._id,
        type: 'spin_bonus',
        amount,
        balanceBefore,
        balanceAfter: user.balance,
        description: `Lucky spin: won ${selectedPrize.label}`,
        status: 'completed',
      })
      rewardMessage = `You won ${selectedPrize.label}!`
    } else if (selectedPrize.type === 'respino') {
      // Give another spin
      user.spinsAvailable += 1
      await user.save()
      rewardMessage = '🎉 One more chance! You get another spin!'
    } else if (selectedPrize.type === 'nothing') {
      rewardMessage = '😊 Thanks for playing! Better luck next time.'
    } else if (selectedPrize.type === 'prize') {
      // Virtual prize: store achievement or just show message
      rewardMessage = `🎉 Congratulations! You won a ${selectedPrize.label}!`
      // Could store in user.achievements or similar
    }

    return NextResponse.json({
      success: true,
      prize: selectedPrize,
      rewardMessage,
      spinsRemaining: user.spinsAvailable,
      newBalance: user.balance,
    })

  } catch (error: any) {
    console.error('Spin error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET - check spin availability
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

    const user = await User.findById(decoded.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      spinsAvailable: user.spinsAvailable || 0,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}