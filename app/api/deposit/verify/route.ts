import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Transaction } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const reference = searchParams.get('reference')
    if (!reference) return NextResponse.json({ error: 'Reference required' }, { status: 400 })

    await connectDB()
    const transaction = await Transaction.findOne({ reference, type: 'deposit' })
    if (!transaction) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })

    return NextResponse.json({
      status: transaction.status,
      message: transaction.status === 'completed' ? 'Payment successful' : transaction.status === 'failed' ? 'Payment failed' : 'Pending',
      transaction,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}