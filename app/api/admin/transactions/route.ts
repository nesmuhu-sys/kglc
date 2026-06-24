import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Transaction, User } from '@/lib/models'
import { verifyToken } from '@/lib/auth'

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

    const transactions = await Transaction.find()
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 })
      .limit(100)

    return NextResponse.json({ success: true, transactions })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}