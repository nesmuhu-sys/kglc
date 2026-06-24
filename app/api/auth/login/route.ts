import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/models'
import { comparePassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Login attempt...')
    
    // Connect to DB
    await connectDB()
    console.log('✅ DB connection established')
    
    const body = await request.json()
    const { phone, password } = body
    
    console.log(`📱 Phone: ${phone}`)

    if (!phone || !password) {
      return NextResponse.json(
        { error: 'Phone and password required' },
        { status: 400 }
      )
    }

    // Check if User model exists
    console.log('🔍 Looking for user...')
    const user = await User.findOne({ phone })
    
    if (!user) {
      console.log('❌ User not found:', phone)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log(`👤 User found: ${user.name} (${user.phone})`)
    console.log(`🔒 Has password: ${!!user.password}`)

    // Check password
    console.log('🔑 Comparing passwords...')
    const valid = await comparePassword(password, user.password)
    console.log(`✅ Password valid: ${valid}`)

    if (!valid) {
      console.log('❌ Invalid password')
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
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
        isActive: user.isActive,
        balance: user.balance,
        level: user.level,
      },
    })
  } catch (error: any) {
    console.error('❌ Login error:', error.message)
    console.error('Full error:', error)
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    )
  }
}