import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User, Level } from '@/lib/models'
import { hashPassword } from '@/lib/auth'

// GET - Check setup status
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Checking setup status...')
    
    await connectDB()
    console.log('✅ DB connected for status check')
    
    const userCount = await User.countDocuments()
    const adminCount = await User.countDocuments({ isAdmin: true })
    const levelCount = await Level.countDocuments()
    
    console.log(`👥 Users: ${userCount}, Admins: ${adminCount}, Levels: ${levelCount}`)
    
    return NextResponse.json({
      success: true,
      usersExist: userCount > 0,
      userCount,
      adminCount,
      levelCount,
      message: userCount > 0 ? 'System ready' : 'No users found'
    })
  } catch (error: any) {
    console.error('❌ Setup status error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to check setup' },
      { status: 500 }
    )
  }
}

// POST - Create admin
export async function POST(request: NextRequest) {
  try {
    console.log('📝 Setup started...')
    
    await connectDB()
    console.log('✅ DB connected for setup')
    
    const count = await User.countDocuments()
    console.log(`👥 Existing users: ${count}`)
    
    if (count > 0) {
      return NextResponse.json({ 
        error: 'Users already exist',
        message: 'Admin already created'
      }, { status: 400 })
    }

    // Create admin
    console.log('👤 Creating admin...')
    const admin = await User.create({
      name: 'Admin',
      phone: '0780000000',
      password: await hashPassword('Admin1234!'),
      isAdmin: true,
      isActive: true,
    })
    console.log(`✅ Admin created: ${admin._id}`)

    // Create levels
    console.log('📊 Creating levels...')
    const levels = [
      { level: 1, price: 15000, dailyTasks: 6, dailyReturn: 2.5, durationDays: 30, isActive: true },
      { level: 2, price: 25000, dailyTasks: 12, dailyReturn: 3.0, durationDays: 30, isActive: true },
      { level: 3, price: 35000, dailyTasks: 20, dailyReturn: 3.5, durationDays: 30, isActive: true },
      { level: 4, price: 45000, dailyTasks: 30, dailyReturn: 4.0, durationDays: 30, isActive: true },
      { level: 5, price: 55000, dailyTasks: 40, dailyReturn: 4.5, durationDays: 30, isActive: true },
    ]
    await Level.insertMany(levels)
    console.log('✅ Levels created')

    return NextResponse.json({
      success: true,
      message: '✅ Admin created successfully!',
      phone: '0780000000',
      password: 'Admin1234!',
      referralCode: admin.referralCode,
    })
  } catch (error: any) {
    console.error('❌ Setup error:', error.message)
    console.error('Full error:', error)
    return NextResponse.json(
      { error: error.message || 'Setup failed' },
      { status: 500 }
    )
  }
}