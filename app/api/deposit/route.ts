import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User, Transaction } from '@/lib/models'
import { verifyToken } from '@/lib/auth'
import crypto from 'crypto'

const RWANDAPAY_BASE_URL = 'https://pay.rwandapay.rw/api/v1'
const PUBLIC_KEY = process.env.RWANDAPAY_PUBLIC_KEY ?? ''
const SECRET_KEY = process.env.RWANDAPAY_SECRET_KEY ?? ''

if (!PUBLIC_KEY || !SECRET_KEY) {
  throw new Error('RwandaPay credentials are not configured. Set RWANDAPAY_PUBLIC_KEY and RWANDAPAY_SECRET_KEY.')
}

function getAppBaseUrl(request: NextRequest) {
  return (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || request.nextUrl.origin || 'https://kglcash.xyz').replace(/\/$/, '')
}

function getGatewayError(result: unknown, status: number) {
  const payload = result && typeof result === 'object' ? result as Record<string, unknown> : {}
  const error = payload.error
  const errorDetails = error && typeof error === 'object' ? error as Record<string, unknown> : {}
  const rawMessage = payload.message ?? (typeof error === 'string' ? error : errorDetails.message)
  const message = typeof rawMessage === 'string' ? rawMessage : `Payment init failed (${status || 'unknown'})`
  const code = typeof errorDetails.code === 'string' ? errorDetails.code : undefined
  return code ? `RwandaPay ${code}: ${message}` : message
}

function generateTxRef(): string {
  return `DEP-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
}

// Background polling
async function pollPaymentStatus(reference: string, transactionId: string) {
  const maxAttempts = 40
  let attempts = 0

  const interval = setInterval(async () => {
    attempts++
    console.log(`Polling deposit ${reference} (attempt ${attempts})`)

    try {
      const response = await fetch(`${RWANDAPAY_BASE_URL}/checkout/${reference}/verify`, {
        headers: {
          'Accept': 'application/json',
          'X-Public-Key': PUBLIC_KEY,
          'X-Secret-Key': SECRET_KEY,
        },
      })
      const data = await response.json()

      if (data.completed === true) {
        clearInterval(interval)
        if (data.success === true) {
          await handleSuccessfulDeposit(reference, transactionId, data)
        } else {
          await handleFailedDeposit(reference, transactionId, data)
        }
      } else if (attempts >= maxAttempts) {
        clearInterval(interval)
        await handleTimeoutDeposit(reference, transactionId)
      }
    } catch (error) {
      if (attempts >= maxAttempts) {
        clearInterval(interval)
        await handleTimeoutDeposit(reference, transactionId)
      }
    }
  }, 3000)
}

async function handleSuccessfulDeposit(reference: string, transactionId: string, data: any) {
  await connectDB()
  const transaction = await Transaction.findById(transactionId)
  if (!transaction || transaction.status !== 'pending') return

  const user = await User.findById(transaction.userId)
  if (!user) return

  transaction.status = 'completed'
  transaction.metadata = {
    ...transaction.metadata,
    payment_data: data,
    transaction_id: data.transaction_id,
    paid_at: data.paid_at,
  }
  transaction.balanceAfter = user.balance + transaction.netAmount
  await transaction.save()

  user.balance += transaction.netAmount
  user.totalEarned = (user.totalEarned || 0) + transaction.netAmount
  await user.save()
  console.log(`✅ Deposit confirmed: ${reference}`)
}

async function handleFailedDeposit(reference: string, transactionId: string, data: any) {
  await connectDB()
  const transaction = await Transaction.findById(transactionId)
  if (!transaction || transaction.status !== 'pending') return

  transaction.status = 'failed'
  transaction.metadata = {
    ...transaction.metadata,
    payment_data: data,
    failure_reason: data.message || 'Payment failed',
  }
  await transaction.save()
  console.log(`❌ Deposit failed: ${reference}`)
}

async function handleTimeoutDeposit(reference: string, transactionId: string) {
  await connectDB()
  const transaction = await Transaction.findById(transactionId)
  if (!transaction || transaction.status !== 'pending') return

  transaction.status = 'failed'
  transaction.metadata = {
    ...transaction.metadata,
    failure_reason: 'Payment timeout (2 minutes exceeded)',
  }
  await transaction.save()
  console.log(`⏰ Deposit timeout: ${reference}`)
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const body = await request.json()
    const { amount, name, phone } = body

    if (!amount || amount < 1000) return NextResponse.json({ error: 'Minimum 1,000 RWF' }, { status: 400 })
    if (amount > 1000000) return NextResponse.json({ error: 'Maximum 1,000,000 RWF' }, { status: 400 })
    if (!name || !phone) return NextResponse.json({ error: 'Name and phone required' }, { status: 400 })
    if (!/^07\d{8}$/.test(phone)) return NextResponse.json({ error: 'Invalid phone (0788123456)' }, { status: 400 })

    const user = await User.findById(decoded.id)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const fee = Math.round(amount * 0.05)
    const netAmount = amount - fee
    const txRef = generateTxRef()

    const transaction = await Transaction.create({
      userId: user._id,
      type: 'deposit',
      amount,
      fee,
      netAmount,
      balanceBefore: user.balance,
      balanceAfter: user.balance,
      description: `Deposit of ${amount} RWF via RwandaPay`,
      status: 'pending',
      reference: txRef,
      metadata: {
        name,
        phone,
        fee,
        netAmount,
        expiresAt: new Date(Date.now() + 2 * 60 * 1000),
      },
    })

    const appBaseUrl = getAppBaseUrl(request)
    let appUrl: URL
    try {
      appUrl = new URL(appBaseUrl)
    } catch {
      return NextResponse.json({ error: 'Payment configuration error: NEXT_PUBLIC_APP_URL must be a valid public HTTPS URL.' }, { status: 500 })
    }

    if (appUrl.protocol !== 'https:' || appUrl.hostname === 'localhost' || appUrl.hostname === '127.0.0.1') {
      return NextResponse.json({ error: 'Payment configuration error: set NEXT_PUBLIC_APP_URL to your deployed public HTTPS domain before using live RwandaPay keys.' }, { status: 500 })
    }

    const paymentData = {
      amount,
      tx_ref: txRef,
      currency: 'RWF',
      customer: {
        name,
        email: user.email || `${user.phone}@kglc.com`,
        phone,
      },
      redirect_url: `${appBaseUrl}/deposit-callback?reference=${txRef}`,
      // RwandaPay returns its own payment reference, so retain our reference in the callback URL.
      webhook_url: `${appBaseUrl}/api/webhook/deposit?reference=${encodeURIComponent(txRef)}`,
      description: `Deposit to KGLC account`,
      meta: { user_id: user._id.toString(), transaction_id: transaction._id.toString() },
    }

    const response = await fetch(`${RWANDAPAY_BASE_URL}/checkout/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Idempotency-Key': txRef,
        'X-Public-Key': PUBLIC_KEY,
        'X-Secret-Key': SECRET_KEY,
      },
      body: JSON.stringify(paymentData),
    })

    const result = await response.json().catch(() => ({}))
    const paymentUrl = result?.data?.payment_url ?? result?.payment_url ?? result?.data?.checkout_url
    const sessionId = result?.data?.session_id ?? result?.session_id

    if (!response.ok || result?.success === false || !paymentUrl) {
      const errorMessage = getGatewayError(result, response.status)
      transaction.status = 'failed'
      transaction.metadata = { ...transaction.metadata, error: errorMessage, gateway_response: result }
      await transaction.save()
      console.error('RwandaPay initialization failed', { status: response.status, result })
      return NextResponse.json({ error: errorMessage }, { status: response.ok ? 400 : response.status || 400 })
    }

    transaction.metadata = {
      ...transaction.metadata,
      session_id: sessionId,
      payment_url: paymentUrl,
    }
    await transaction.save()

    // RwandaPay confirms payment through the signed webhook. Its verification endpoint expects
    // RwandaPay's payment reference, not this merchant tx_ref, so do not poll it with txRef.

    return NextResponse.json({
      success: true,
      message: 'Deposit initiated',
      data: {
        reference: txRef,
        payment_url: paymentUrl,
        session_id: sessionId,
        expires_in: '2 minutes',
        fee,
        net_amount: netAmount,
      },
    })
  } catch (error: any) {
    console.error('Deposit error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}