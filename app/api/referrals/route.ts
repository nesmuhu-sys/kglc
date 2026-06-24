import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/models'
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

    const user = await User.findById(decoded.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find all users referred by this user
    const referredUsers = await User.find({ referredBy: user._id })
    const total = referredUsers.length
    const active = referredUsers.filter(u => u.isActive).length
    const inactive = total - active
    
    // Direct vs indirect: we only track direct referrals from this user
    // Indirect would be referrals of referrals, but we don't track that simply.
    const direct = total
    const indirect = 0 // placeholder for now

    return NextResponse.json({
      success: true,
      stats: {
        total,
        active,
        inactive,
        direct,
        indirect,
      }
    })
  } catch (error: any) {
    console.error('Referrals error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}