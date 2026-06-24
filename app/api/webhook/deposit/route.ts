import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User, Transaction } from '@/lib/models'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Verify webhook signature (if implemented by RwandaPay)
    // For now, we trust the webhook
    const payload = await request.json()
    console.log('Webhook received:', payload)

    // Check if it's a payment.successful event
    if (payload.event !== 'payment.successful') {
      return NextResponse.json({ received: true })
    }

    const data = payload.data
    const reference = data.reference
    const transactionId = data.transaction_id
    const amount = data.amount
    const status = data.status

    // Find the transaction
    const transaction = await Transaction.findOne({
      reference: reference,
      type: 'deposit',
      status: 'pending',
    })

    if (!transaction) {
      console.log(`Transaction not found or already processed: ${reference}`)
      return NextResponse.json({ received: true })
    }

    // Already processed?
    if (transaction.status !== 'pending') {
      return NextResponse.json({ received: true })
    }

    // Verify amount matches
    if (transaction.amount !== amount) {
      transaction.status = 'failed'
      transaction.metadata = {
        ...transaction.metadata,
        webhook_error: `Amount mismatch: expected ${transaction.amount}, got ${amount}`,
      }
      await transaction.save()
      return NextResponse.json({ received: true })
    }

    // Get user
    const user = await User.findById(transaction.userId)
    if (!user) {
      transaction.status = 'failed'
      transaction.metadata = {
        ...transaction.metadata,
        webhook_error: 'User not found',
      }
      await transaction.save()
      return NextResponse.json({ received: true })
    }

    // Update transaction
    transaction.status = 'completed'
    transaction.metadata = {
      ...transaction.metadata,
      webhook_data: data,
      transaction_id: transactionId,
      paid_at: data.paid_at,
    }
    transaction.balanceAfter = user.balance + transaction.netAmount
    await transaction.save()

    // Update user balance
    user.balance += transaction.netAmount
    user.totalEarned = (user.totalEarned || 0) + transaction.netAmount
    await user.save()

    console.log(`✅ Webhook confirmed deposit: ${reference} for user ${user.phone}`)

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}