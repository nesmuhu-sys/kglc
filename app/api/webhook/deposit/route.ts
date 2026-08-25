import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectDB } from '@/lib/db'
import { User, Transaction } from '@/lib/models'

const WEBHOOK_SECRET = process.env.RWANDAPAY_WEBHOOK_SECRET

function hasValidSignature(rawBody: string, signature: string | null) {
  if (!WEBHOOK_SECRET || !signature) return false

  const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(rawBody).digest('base64')
  const received = Buffer.from(signature.trim())
  const expectedBuffer = Buffer.from(expected)

  return received.length === expectedBuffer.length && crypto.timingSafeEqual(received, expectedBuffer)
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  if (!WEBHOOK_SECRET) {
    console.error('RwandaPay webhook is not configured: RWANDAPAY_WEBHOOK_SECRET is missing')
    return NextResponse.json({ error: 'Webhook is not configured' }, { status: 500 })
  }

  if (!hasValidSignature(rawBody, request.headers.get('x-webhook-signature'))) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
  }

  try {
    const payload = JSON.parse(rawBody)
    const data = payload.data ?? payload
    const event = payload.event ?? payload.event_kind
    const status = data.status ?? payload.status
    const isSuccessful = event === 'payment.successful' || (event === 'transaction:processed' && status === 'successful')
    const isFailed = event === 'payment.failed' || (event === 'transaction:processed' && status === 'failed')

    if (!isSuccessful && !isFailed) return NextResponse.json({ received: true })

    // This reference is deliberately included in webhook_url during checkout initialization.
    // Do not use paypack_reference here: it is RwandaPay's provider reference, not our tx_ref.
    const reference = request.nextUrl.searchParams.get('reference') || data.merchant_reference || data.tx_ref
    if (!reference) {
      console.error('RwandaPay webhook did not include a merchant reference')
      return NextResponse.json({ received: true })
    }

    await connectDB()
    const transaction = await Transaction.findOne({ reference, type: 'deposit', status: 'pending' })
    if (!transaction) return NextResponse.json({ received: true })

    const receivedAmount = Number(data.amount ?? payload.amount)
    if (!Number.isFinite(receivedAmount) || receivedAmount !== transaction.amount) {
      transaction.status = 'failed'
      transaction.metadata = {
        ...transaction.metadata,
        webhook_error: `Amount mismatch: expected ${transaction.amount}, got ${data.amount ?? payload.amount}`,
        webhook_data: payload,
      }
      await transaction.save()
      return NextResponse.json({ received: true })
    }

    if (isFailed) {
      transaction.status = 'failed'
      transaction.metadata = { ...transaction.metadata, webhook_data: payload, failure_reason: data.message ?? payload.message ?? 'Payment failed' }
      await transaction.save()
      return NextResponse.json({ received: true })
    }

    const user = await User.findById(transaction.userId)
    if (!user) {
      transaction.status = 'failed'
      transaction.metadata = { ...transaction.metadata, webhook_error: 'User not found', webhook_data: payload }
      await transaction.save()
      return NextResponse.json({ received: true })
    }

    transaction.status = 'completed'
    transaction.metadata = {
      ...transaction.metadata,
      webhook_data: payload,
      payment_reference: data.paypack_reference ?? payload.paypack_reference,
      paid_at: data.paid_at ?? payload.paid_at,
    }
    transaction.balanceAfter = user.balance + transaction.netAmount
    await transaction.save()

    user.balance += transaction.netAmount
    user.totalEarned = (user.totalEarned || 0) + transaction.netAmount
    await user.save()

    console.log(`RwandaPay deposit confirmed: ${reference}`)
    return NextResponse.json({ received: true })
  } catch (error: unknown) {
    console.error('RwandaPay webhook error:', error)
    const message = error instanceof Error ? error.message : 'Invalid webhook payload'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}