import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User, Transaction } from '@/lib/models'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const body = await request.json()
    const { amount, name, phone, paymentMethod } = body

    if (!amount || amount < 1000) return NextResponse.json({ error: 'Minimum 1,000 RWF' }, { status: 400 })
    if (amount > 1000000) return NextResponse.json({ error: 'Maximum 1,000,000 RWF' }, { status: 400 })
    if (!name || !phone) return NextResponse.json({ error: 'Name and phone required' }, { status: 400 })
    if (!/^07\d{8}$/.test(phone)) return NextResponse.json({ error: 'Invalid phone (0788123456)' }, { status: 400 })

    const user = await User.findById(decoded.id)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (user.balance < amount) return NextResponse.json({ error: `Insufficient balance: ${user.balance} RWF` }, { status: 400 })

    const fee = Math.round(amount * 0.05)
    const netAmount = amount - fee
    const reference = `WTH-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    const transaction = await Transaction.create({
      userId: user._id,
      type: 'withdrawal',
      amount,
      fee,
      netAmount,
      balanceBefore: user.balance,
      balanceAfter: user.balance - amount,
      description: `Withdrawal of ${amount} RWF to ${paymentMethod || 'Mobile Money'}`,
      status: 'pending',
      reference,
      metadata: {
        name,
        phone,
        paymentMethod: paymentMethod || 'mobile_money',
        fee,
        netAmount,
        admin_notes: '',
      },
    })

    user.balance -= amount
    await user.save()

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted. Awaiting admin approval.',
      data: { reference, amount, fee, netAmount, status: 'pending' },
    })
  } catch (error: any) {
    console.error('Withdrawal error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}