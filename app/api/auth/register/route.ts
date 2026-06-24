import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/models'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { name, phone, referralCode, password } = body

    if (!name || !phone || !password) {
      return NextResponse.json(
        { error: 'Name, phone, password required' },
        { status: 400 }
      )
    }

    if (!/^07\d{8}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone (07XXXXXXXX)' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password min 8 chars' },
        { status: 400 }
      )
    }

    const existing = await User.findOne({ phone })
    if (existing) {
      return NextResponse.json(
        { error: 'Phone already registered' },
        { status: 400 }
      )
    }

    const userCount = await User.countDocuments()
    let referrer = null

    if (userCount > 0) {
      if (!referralCode) {
        return NextResponse.json(
          { error: 'Referral code required' },
          { status: 400 }
        )
      }
      referrer = await User.findOne({ referralCode: referralCode.toUpperCase() })
      if (!referrer) {
        return NextResponse.json(
          { error: 'Invalid referral code' },
          { status: 400 }
        )
      }
    }

    const user = await User.create({
      name,
      phone,
      password: await hashPassword(password),
      referredBy: referrer?._id,
      isActive: false,
      isAdmin: userCount === 0,
    })

    if (referrer) {
      referrer.referrals.direct += 1
      await referrer.save()
    }

    const token = generateToken(user._id.toString())

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        referralCode: user.referralCode,
      },
    })
  } catch (error: any) {
    console.error('❌ Register error:', error)
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    )
  }
}