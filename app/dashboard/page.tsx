'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Home, Trophy, Coins, Users, Settings, LogOut, 
  Gift, Copy, Check, X, Download, Smartphone, RefreshCw, AlertCircle, Plus, Sparkles, ArrowRight
} from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'

type Tab = 'home' | 'tasks' | 'earnings' | 'referrals' | 'account'
type Language = 'rw' | 'en'

// Translations
const t = {
  rw: {
    home: 'Ahabanza',
    tasks: 'Imirimo',
    earnings: 'Amafaranga',
    referrals: 'Abatumira',
    account: 'Konti',
    balance: 'Amafaranga',
    level: 'Urwego',
    dailyTasks: 'Imirimo ya None',
    available: 'Birahari',
    noTasks: 'Nta mirimo ihari ubu',
    earn: 'Kora',
    deposit: 'Shyira',
    withdraw: 'Kura',
    totalEarned: 'Byose wakoze',
    totalWithdrawn: 'Byose wakuye',
    referralCode: 'Kode yo Gutumira',
    copy: 'Koporora',
    copied: 'Yakoporowe!',
    active: 'Bakora',
    inactive: 'Ntabakora',
    direct: 'Biturutse kuri wewe',
    invite: 'Tumira',
    indirect: 'Biturutse kuri abo watumiye',
    buyLevel: 'Gura Urwego',
    yourLevel: 'Urwego rwawe',
    install: 'Shyiramo',
    test: 'Gerageza',
    close: 'Funga',
    processing: 'Birakora...',
    reward: 'Ibihembo',
    daysLeft: 'Iminsi isigaye',
    share: 'Sangiza',
    price: 'Igiciro',
    confirm: 'Emeza',
    cancel: 'Hagarika',
    yourBalance: 'Amafaranga yawe',
    insufficientBalance: 'Nta mafaranga ahagije',
    buyLevelTitle: 'Hitamo Urwego',
    purchase: 'Gura',
    spin: 'Spin',
    spinTitle: '🔄 Spin the Wheel!',
    spinButton: 'Spin!',
    spinning: 'Birazunguruka...',
    prize: 'Igihembo',
    noSpins: 'Nta spin bihari',
    spins: 'Spin',
    installApp: 'Shyiramo Porogaramu',
    testing: 'Gerageza...',
    done: 'Byarangiye!',
    viewAll: 'Reba zose',
    error: 'Ikosa',
    retry: 'Ongera',
    getTask: 'Kora Imirimo',
    availableToday: 'Birahari uyu munsi',
    brandLogos: 'Ibikorwa',
    tasksList: 'Urutonde rw\'imirimo',
    goToTasks: 'Jya ku mirimo',
    youHave: 'Ufite',
    depositTitle: 'Shyira Amafaranga',
    withdrawTitle: 'Kura Amafaranga',
    amount: 'Amafaranga',
    fullName: 'Izina Ryose',
    phoneNumber: 'Numero ya Telefone',
    feeInfo: '5% y\'igiciro',
    timeLimit: 'Igihe: iminota 2',
    minimumDeposit: 'Nibura 1,000 RWF',
    paymentMethod: 'Uburyo bwo kwishyura',
    mobileMoney: 'Mobile Money',
    bankTransfer: 'Kwishyura kuri Banki',
    submit: 'Ohereza',
    cancelling: 'Hagarika',
    depositSuccess: 'Kwohereza byagenze neza!',
    withdrawalSuccess: 'Kura byagenze neza!',
    approveWait: 'Tegereza gushyirwa mu bikorwa',
    fee: 'Ikiguzi',
    netAmount: 'Amafaranga azaboneka',
  },
  en: {
    home: 'Home',
    tasks: 'Tasks',
    earnings: 'Earnings',
    referrals: 'Referrals',
    account: 'Account',
    balance: 'Balance',
    level: 'Level',
    dailyTasks: "Today's Tasks",
    available: 'Available',
    noTasks: 'No tasks available',
    earn: 'Earn',
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    totalEarned: 'Total Earned',
    totalWithdrawn: 'Total Withdrawn',
    referralCode: 'Referral Code',
    copy: 'Copy',
    copied: 'Copied!',
    active: 'Active',
    inactive: 'Inactive',
    direct: 'Direct',
    invite: 'Invite',
    indirect: 'Indirect',
    buyLevel: 'Buy Level',
    yourLevel: 'Your Level',
    install: 'Install',
    test: 'Test',
    close: 'Close',
    processing: 'Processing...',
    reward: 'Reward',
    daysLeft: 'Days Left',
    share: 'Share',
    price: 'Price',
    confirm: 'Confirm',
    cancel: 'Cancel',
    yourBalance: 'Your Balance',
    insufficientBalance: 'Insufficient balance',
    buyLevelTitle: 'Choose Level',
    purchase: 'Purchase',
    spin: 'Spin',
    spinTitle: '🔄 Spin the Wheel!',
    spinButton: 'Spin!',
    spinning: 'Spinning...',
    prize: 'Prize',
    noSpins: 'No spins available',
    spins: 'Spins',
    installApp: 'Install App',
    testing: 'Testing...',
    done: 'Complete!',
    viewAll: 'View All',
    error: 'Error',
    retry: 'Retry',
    getTask: 'Get Task',
    availableToday: 'Available Today',
    brandLogos: 'Brands',
    tasksList: 'Task List',
    goToTasks: 'Go to Tasks',
    youHave: 'You have',
    depositTitle: 'Deposit Funds',
    withdrawTitle: 'Withdraw Funds',
    amount: 'Amount',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    feeInfo: '5% fee applies',
    timeLimit: 'Time limit: 2 minutes',
    minimumDeposit: 'Minimum 1,000 RWF',
    paymentMethod: 'Payment Method',
    mobileMoney: 'Mobile Money',
    bankTransfer: 'Bank Transfer',
    submit: 'Submit',
    cancelling: 'Cancel',
    depositSuccess: 'Deposit submitted!',
    withdrawalSuccess: 'Withdrawal submitted!',
    approveWait: 'Awaiting admin approval',
    fee: 'Fee',
    netAmount: 'Net Amount',
  }
}

const PRIZES = [
  { label: 'Thanks', icon: '😊', color: '#f44336', weight: 30, value: 0, type: 'nothing' },
  { label: '1K RWF', icon: '💰', color: '#2196f3', weight: 20, value: 1000, type: 'cash' },
  { label: '5K RWF', icon: '💰', color: '#4caf50', weight: 12, value: 5000, type: 'cash' },
  { label: 'Bike', icon: '🚲', color: '#ff9800', weight: 8, value: 0, type: 'prize' },
  { label: 'Motorbike', icon: '🏍️', color: '#9c27b0', weight: 4, value: 0, type: 'prize' },
  { label: 'Car', icon: '🚗', color: '#e91e63', weight: 1, value: 0, type: 'prize' },
  { label: 'One More', icon: '🔄', color: '#00bcd4', weight: 25, value: 0, type: 'respino' },
]

const ALL_APPS = [
  { id: 1, name: 'Google', domain: 'google.com', description: 'Test Google Search app', level: 1 },
  { id: 2, name: 'Facebook', domain: 'facebook.com', description: 'Verify Facebook app features', level: 1 },
  { id: 3, name: 'YouTube', domain: 'youtube.com', description: 'Test YouTube video playback', level: 2 },
  { id: 4, name: 'WhatsApp', domain: 'whatsapp.com', description: 'Check WhatsApp messaging', level: 2 },
  { id: 5, name: 'Instagram', domain: 'instagram.com', description: 'Test Instagram stories', level: 3 },
  { id: 6, name: 'TikTok', domain: 'tiktok.com', description: 'Verify TikTok video upload', level: 3 },
  { id: 7, name: 'Netflix', domain: 'netflix.com', description: 'Test Netflix streaming', level: 4 },
  { id: 8, name: 'Spotify', domain: 'spotify.com', description: 'Test Spotify music playback', level: 4 },
  { id: 9, name: 'Amazon', domain: 'amazon.com', description: 'Test Amazon shopping', level: 5 },
  { id: 10, name: 'Twitter/X', domain: 'twitter.com', description: 'Check Twitter feed', level: 5 },
]

const BRAND_LOGOS = [
  'google.com', 'facebook.com', 'youtube.com', 'whatsapp.com',
  'instagram.com', 'tiktok.com', 'netflix.com', 'spotify.com',
  'amazon.com', 'twitter.com', 'microsoft.com', 'apple.com',
  'linkedin.com', 'snapchat.com', 'pinterest.com', 'uber.com',
  'airbnb.com', 'dropbox.com', 'slack.com', 'zoom.us',
]

interface AppLogoProps {
  name: string
  domain: string
  className?: string
}

const AppLogo = ({ name, domain, className = 'w-8 h-8' }: AppLogoProps) => {
  const [error, setError] = useState(false)
  return (
    <div className={`flex items-center justify-center overflow-hidden ${className}`}>
      {!error ? (
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
          alt={name}
          className="w-full h-full object-contain"
          onError={() => setError(true)}
        />
      ) : (
        <span className="text-blue-600 font-bold text-lg">{name.charAt(0)}</span>
      )}
    </div>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const [lang] = useState<Language>('rw')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [balance, setBalance] = useState(0)
  const [totalEarned, setTotalEarned] = useState(0)
  const [totalWithdrawn, setTotalWithdrawn] = useState(0)
  const [level, setLevel] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [levelExpiry, setLevelExpiry] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [dailyLimit, setDailyLimit] = useState(0)
  const [tasksRemaining, setTasksRemaining] = useState(0)
  const [perTaskReward, setPerTaskReward] = useState(0)
  const [availableApps, setAvailableApps] = useState(ALL_APPS)
  const [spinsAvailable, setSpinsAvailable] = useState(0)
  const [referralsData, setReferralsData] = useState({ total: 0, active: 0, inactive: 0, direct: 0, indirect: 0 })
  
  // Task popup state
  const [showTaskPopup, setShowTaskPopup] = useState(false)
  const [currentTask, setCurrentTask] = useState<any>(null)
  const [taskStep, setTaskStep] = useState<'select' | 'install' | 'test' | 'done'>('select')
  const [isProcessing, setIsProcessing] = useState(false)
  const [taskError, setTaskError] = useState('')
  
  // Deposit/Withdraw modals
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [depositName, setDepositName] = useState('')
  const [depositPhone, setDepositPhone] = useState('')
  const [depositLoading, setDepositLoading] = useState(false)
  const [depositError, setDepositError] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawName, setWithdrawName] = useState('')
  const [withdrawPhone, setWithdrawPhone] = useState('')
  const [withdrawMethod, setWithdrawMethod] = useState('mobile_money')
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [withdrawError, setWithdrawError] = useState('')

  // Other UI state
  const [copied, setCopied] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [confettiType, setConfettiType] = useState('')
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [levels, setLevels] = useState<any[]>([])
  const [buyLoading, setBuyLoading] = useState(false)
  const [buyError, setBuyError] = useState('')
  const [showSpinModal, setShowSpinModal] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [spinResult, setSpinResult] = useState<any>(null)
  const [rotation, setRotation] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const taskTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const text = t[lang]

  // Refresh data
  const refreshData = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const userRes = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const userData = await userRes.json()
      if (userData.success) {
        const u = userData.user
        setName(u.name)
        setPhone(u.phone)
        setBalance(u.balance || 0)
        setTotalEarned(u.totalEarned || 0)
        setTotalWithdrawn(u.totalWithdrawn || 0)
        setLevel(u.level || 0)
        setIsActive(u.isActive || false)
        setLevelExpiry(u.levelExpiry)
        setReferralCode(u.referralCode)
        setDailyLimit(u.dailyLimit || 0)
        setTasksRemaining(u.dailyTasksRemaining || 0)
        setPerTaskReward(u.perTaskReward || 0)
        setSpinsAvailable(u.spinsAvailable || 0)
      }
      const refRes = await fetch('/api/referrals', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const refData = await refRes.json()
      if (refData.success) setReferralsData(refData.stats)
      const levelsRes = await fetch('/api/levels')
      const levelsData = await levelsRes.json()
      if (levelsData.success) setLevels(levelsData.levels)
    } catch (error) {
      console.error('Refresh error:', error)
    }
  }, [])

  // Initial load
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/'); return }
    refreshData().finally(() => setLoading(false))
  }, [refreshData, router])

  // Filter apps based on level
  useEffect(() => {
    if (level > 0) {
      setAvailableApps(ALL_APPS.filter(app => app.level <= level))
    } else {
      setAvailableApps([])
    }
  }, [level])

  // Spin wheel effect
  useEffect(() => {
    if (showSpinModal && canvasRef.current) drawWheel()
  }, [showSpinModal])

  const drawWheel = (rotate = 0) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const width = canvas.width, height = canvas.height
    const centerX = width/2, centerY = height/2
    const radius = Math.min(width, height)/2 * 0.9
    ctx.clearRect(0, 0, width, height)
    const segmentAngle = 2 * Math.PI / PRIZES.length
    PRIZES.forEach((prize, i) => {
      const start = i * segmentAngle + rotate
      const end = start + segmentAngle
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, start, end)
      ctx.closePath()
      ctx.fillStyle = prize.color
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(start + segmentAngle/2)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 14px sans-serif'
      ctx.fillText(prize.icon, radius*0.65, 0)
      ctx.font = 'bold 10px sans-serif'
      ctx.fillText(prize.label, radius*0.65 + 20, 0)
      ctx.restore()
    })
    ctx.beginPath()
    ctx.arc(centerX, centerY, 20, 0, 2*Math.PI)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(centerX - 10, 10)
    ctx.lineTo(centerX + 10, 10)
    ctx.lineTo(centerX, 30)
    ctx.closePath()
    ctx.fillStyle = '#ff0000'
    ctx.fill()
  }

  const spinWheel = async () => {
    if (spinning || spinsAvailable <= 0) return
    setSpinning(true)
    setSpinResult(null)
    setShowConfetti(false)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        const prizeIndex = PRIZES.findIndex(p => p.label === data.prize.label)
        const segmentAngle = 2 * Math.PI / PRIZES.length
        const target = -Math.PI/2 - (prizeIndex * segmentAngle + segmentAngle/2)
        const extra = 5 + Math.floor(Math.random() * 4)
        const totalRotation = target + extra * 2 * Math.PI
        setSpinResult(data)
        const duration = 4000, startTime = performance.now(), startRotation = rotation
        // --- FIX: add : number to time ---
        const animate = (time: number) => {
          const elapsed = time - startTime
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          const current = startRotation + (totalRotation - startRotation) * eased
          setRotation(current)
          drawWheel(current)
          if (progress < 1) requestAnimationFrame(animate)
          else {
            setRotation(totalRotation)
            drawWheel(totalRotation)
            setSpinning(false)
            setSpinsAvailable(data.spinsRemaining)
            if (data.prize.type === 'cash') {
              setBalance(data.newBalance)
              if (data.prize.value >= 1000) {
                setShowConfetti(true); setConfettiType('cash')
                setTimeout(() => setShowConfetti(false), 3000)
              }
            } else if (data.prize.type === 'prize') {
              setShowConfetti(true); setConfettiType('prize')
              setTimeout(() => setShowConfetti(false), 3000)
            }
            refreshData()
          }
        }
        requestAnimationFrame(animate)
      } else {
        alert(data.error || 'Spin failed')
        setSpinning(false)
      }
    } catch (error) {
      console.error('Spin error:', error)
      alert('Error spinning')
      setSpinning(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  // Task functions
  const getRandomTask = () => {
    if (tasksRemaining <= 0) return null
    const filtered = availableApps.filter(app => app.level <= level)
    if (filtered.length === 0) return null
    return filtered[Math.floor(Math.random() * filtered.length)]
  }

  const handleGetTask = (task: any) => {
    if (tasksRemaining <= 0) {
      alert(text.noTasks)
      return
    }
    setCurrentTask(task)
    setTaskStep('select')
    setTaskError('')
    setShowTaskPopup(true)
  }

  const handleGetRandomTask = () => {
    const task = getRandomTask()
    if (task) handleGetTask(task)
    else alert(text.noTasks)
  }

  const handleInstall = () => {
    setTaskStep('install')
    setIsProcessing(true)
    setTaskError('')
    if (taskTimeoutRef.current) clearTimeout(taskTimeoutRef.current)
    taskTimeoutRef.current = setTimeout(() => {
      setIsProcessing(false)
      setTaskStep('test')
      handleStartTest()
    }, 3000)
  }

  const handleStartTest = () => {
    setIsProcessing(true)
    setTaskError('')
    taskTimeoutRef.current = setTimeout(async () => {
      setIsProcessing(false)
      await completeTask()
    }, 5000)
  }

  const completeTask = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setTaskError('No token found')
      setTaskStep('select')
      return
    }
    try {
      const res = await fetch('/api/user/update-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'task_earning' })
      })

      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text()
        console.error('Non-JSON response:', text)
        throw new Error('Server returned non-JSON response')
      }

      const data = await res.json()
      if (res.ok && data.success) {
        setBalance(data.balance)
        setTotalEarned(data.totalEarned)
        setTasksRemaining(data.dailyTasksRemaining)
        setTaskStep('done')
        setShowConfetti(true); setConfettiType('task')
        setTimeout(() => setShowConfetti(false), 2000)
        setTimeout(() => {
          setShowTaskPopup(false)
          setCurrentTask(null)
          setTaskStep('select')
          setTaskError('')
        }, 2000)
      } else {
        setTaskError(data.error || 'Failed to complete task')
        setTaskStep('select')
        setIsProcessing(false)
      }
    } catch (error) {
      console.error('Task error:', error)
      setTaskError('Network error. Please try again.')
      setTaskStep('select')
      setIsProcessing(false)
    }
  }

  // Copy handler
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Buy level
  const handleBuyLevel = async (levelNumber: number) => {
    setBuyError('')
    const level = levels.find(l => l.level === levelNumber)
    if (!level) { setBuyError('Level not found'); return }
    if (balance < level.price) {
      setBuyError(`${text.insufficientBalance}: ${balance} RWF < ${level.price} RWF`)
      return
    }
    setBuyLoading(true)
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('/api/levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ levelNumber })
      })
      const data = await res.json()
      if (data.success) {
        setBalance(data.user.balance)
        setLevel(data.user.level)
        setIsActive(data.user.isActive)
        setLevelExpiry(data.user.levelExpiry)
        setDailyLimit(data.user.dailyLimit || 0)
        setTasksRemaining(data.user.dailyTasksRemaining || 0)
        setPerTaskReward(data.user.perTaskReward || 0)
        setShowBuyModal(false)
        setShowConfetti(true); setConfettiType('levelup')
        setTimeout(() => setShowConfetti(false), 3000)
        alert(`Level ${levelNumber} purchased!`)
        refreshData()
      } else {
        setBuyError(data.error || 'Purchase failed')
      }
    } catch (error: unknown) {
      setBuyError(error instanceof Error ? error.message : 'Error purchasing level')
    } finally {
      setBuyLoading(false)
    }
  }

  // Deposit handlers
  const handleDeposit = async () => {
    setDepositError('')
    setDepositLoading(true)

    const amount = parseFloat(depositAmount)
    if (isNaN(amount) || amount < 1000) {
      setDepositError('Minimum deposit is 1,000 RWF')
      setDepositLoading(false)
      return
    }

    if (!depositName.trim()) {
      setDepositError('Please enter your full name')
      setDepositLoading(false)
      return
    }

    if (!/^07\d{8}$/.test(depositPhone)) {
      setDepositError('Invalid phone number. Use 0788123456 format')
      setDepositLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: amount,
          name: depositName,
          phone: depositPhone,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Deposit failed')
      }

      // Redirect to RwandaPay payment page
      window.location.href = data.data.payment_url
    } catch (error: unknown) {
      setDepositError(error instanceof Error ? error.message : 'Deposit failed')
      setDepositLoading(false)
    }
  }

  // Withdraw handlers
  const handleWithdraw = async () => {
    setWithdrawError('')
    setWithdrawLoading(true)

    const amount = parseFloat(withdrawAmount)
    if (isNaN(amount) || amount < 1000) {
      setWithdrawError('Minimum withdrawal is 1,000 RWF')
      setWithdrawLoading(false)
      return
    }

    if (amount > balance) {
      setWithdrawError(`Insufficient balance. Available: ${balance} RWF`)
      setWithdrawLoading(false)
      return
    }

    if (!withdrawName.trim()) {
      setWithdrawError('Please enter your full name')
      setWithdrawLoading(false)
      return
    }

    if (!/^07\d{8}$/.test(withdrawPhone)) {
      setWithdrawError('Invalid phone number. Use 0788123456 format')
      setWithdrawLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: amount,
          name: withdrawName,
          phone: withdrawPhone,
          paymentMethod: withdrawMethod,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Withdrawal failed')
      }

      alert('Withdrawal request submitted! Awaiting admin approval.')
      setShowWithdrawModal(false)
      setWithdrawAmount('')
      setWithdrawName('')
      setWithdrawPhone('')
      refreshData()
    } catch (error: unknown) {
      setWithdrawError(error instanceof Error ? error.message : 'Withdrawal failed')
      setWithdrawLoading(false)
    }
  }

  const tabs = [
    { id: 'home', icon: Home, label: text.home },
    { id: 'tasks', icon: Trophy, label: text.tasks },
    { id: 'earnings', icon: Coins, label: text.earnings },
    { id: 'referrals', icon: Users, label: text.referrals },
    { id: 'account', icon: Settings, label: text.account },
  ]

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
  }

  // Marquee component
  const MarqueeBrands = () => (
    <div className="overflow-hidden whitespace-nowrap py-2">
      <div className="inline-block animate-marquee">
        {BRAND_LOGOS.concat(BRAND_LOGOS).map((domain, i) => (
          <span key={i} className="inline-flex items-center mx-3">
            <img
              src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
              alt="logo"
              className="w-6 h-6 inline-block"
              onError={(e) => e.currentTarget.style.display = 'none'}
            />
          </span>
        ))}
      </div>
    </div>
  )

  // Home tab
  const renderHomeTab = () => (
    <>
      <div className="bg-white rounded-2xl shadow-sm p-2 mb-4 border border-gray-100">
        <p className="text-xs text-gray-400 text-center mb-1">{text.brandLogos}</p>
        <MarqueeBrands />
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 border border-gray-100">
        <p className="font-bold text-gray-900">{name}</p>
        <p className="text-sm text-gray-500">{phone}</p>
        <div className="flex gap-2 mt-2 flex-wrap">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{referralCode}</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {isActive ? '✅ Active' : '⚠️ Inactive'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-4 text-white shadow-lg shadow-blue-200">
          <p className="text-blue-100 text-sm">{text.balance}</p>
          <p className="text-2xl font-bold">{balance.toLocaleString()} RWF</p>
        </div>
        <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl p-4 text-white shadow-lg shadow-purple-200">
          <p className="text-purple-100 text-sm">{text.level}</p>
          <p className="text-2xl font-bold">L{level}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 text-center">
        <h3 className="font-bold text-gray-900">{text.dailyTasks}</h3>
        <p className="text-3xl font-bold text-blue-600">{tasksRemaining}</p>
        <p className="text-sm text-gray-500 mb-2">{text.availableToday}</p>
        <button 
          onClick={() => setActiveTab('tasks')}
          className="text-blue-600 font-medium text-sm flex items-center justify-center gap-1 hover:underline"
        >
          {text.goToTasks} <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <button onClick={() => setActiveTab('referrals')} className="bg-green-600 text-white rounded-2xl p-4 hover:bg-green-700 transition text-center shadow-lg shadow-green-200">
          <Users className="w-6 h-6 mx-auto mb-1" />
          <span className="text-sm font-medium">{text.invite}</span>
          <p className="text-xs text-green-100">7% • 5% • 3%</p>
        </button>
        <button onClick={() => spinsAvailable > 0 ? setShowSpinModal(true) : alert(text.noSpins)}
          className={`bg-orange-500 text-white rounded-2xl p-4 hover:bg-orange-600 transition text-center shadow-lg shadow-orange-200 ${spinsAvailable <= 0 ? 'opacity-50' : 'animate-pulse'}`}>
          <Gift className="w-6 h-6 mx-auto mb-1" />
          <span className="text-sm font-medium">{text.spin}</span>
          <p className="text-xs text-orange-100">{spinsAvailable} {text.spins}</p>
        </button>
      </div>
    </>
  )

  // Confetti overlay
  const renderConfetti = () => {
    if (!showConfetti) return null
    const emojis = confettiType === 'cash' ? ['💰','💎','✨','🎉'] : confettiType === 'prize' ? ['🏆','🎊','⭐','🌈'] : confettiType === 'levelup' ? ['🚀','⭐','🌟','💪'] : ['🎉','✨','🎊','🌟']
    return (
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="absolute animate-float" style={{ left: Math.random() * 100 + '%', top: '-10%', animationDelay: Math.random() * 2 + 's', fontSize: Math.random() * 20 + 20 + 'px', transform: `rotate(${Math.random() * 360}deg)` }}>
            {emojis[Math.floor(Math.random() * emojis.length)]}
          </div>
        ))}
      </div>
    )
  }

  return (
    <main className="min-h-screen pb-24 bg-gray-50">
      {renderConfetti()}
      <style>{`
        @keyframes float { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
        .animate-float { animation: float linear forwards; }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        @keyframes slide-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes spin-slow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 1.5s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 20s linear infinite; }
      `}</style>
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-6">
          <img src="/logo1.png" alt="KGLC" className="w-14 h-14 md:w-16 md:h-16 object-contain" />
          <button onClick={handleLogout} className="p-2 text-gray-600 hover:text-red-600 transition-colors"><LogOut size={20} /></button>
        </div>

        {activeTab === 'home' && renderHomeTab()}

        {activeTab === 'tasks' && (
          <div>
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 mb-4">
              <h3 className="font-bold text-gray-900 mb-2">🌍 {text.tasksList}</h3>
              <div className="flex flex-wrap gap-2">
                {availableApps.slice(0,6).map(app => (
                  <div key={app.id} className="bg-gray-50 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                    <AppLogo name={app.name} domain={app.domain} className="w-4 h-4" />
                    <span>{app.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={handleGetRandomTask}
              disabled={tasksRemaining <= 0}
              className={`w-full py-4 rounded-xl text-white font-medium transition flex items-center justify-center gap-2 mb-4 ${
                tasksRemaining > 0 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-200' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              {tasksRemaining > 0 ? text.getTask : text.noTasks}
            </button>

            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 mb-4">
              <div className="flex justify-between items-center"><span className="text-sm text-gray-600">{text.available}</span><span className="font-bold text-lg">{tasksRemaining}</span></div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2"><div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${dailyLimit > 0 ? (tasksRemaining / dailyLimit) * 100 : 0}%` }}></div></div>
              <p className="text-xs text-gray-400 mt-1">{tasksRemaining} / {dailyLimit} {text.dailyTasks}</p>
            </div>

            {availableApps.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 text-center">
                <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">{text.noTasks}</p>
                <button onClick={() => setActiveTab('account')} className="mt-2 text-blue-600 text-sm font-medium">{text.buyLevel}</button>
              </div>
            ) : (
              <div className="space-y-3">
                {availableApps.map(task => (
                  <div key={task.id} className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <AppLogo name={task.name} domain={task.domain} className="w-12 h-12 rounded-xl bg-white shadow-sm" />
                      <div className="flex-1"><h4 className="font-bold text-gray-900">{task.name}</h4><p className="text-xs text-gray-500">L{task.level} • {perTaskReward} RWF</p></div>
                      <button onClick={() => handleGetTask(task)} disabled={tasksRemaining <= 0} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tasksRemaining > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                        {tasksRemaining > 0 ? text.earn : text.noTasks}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'earnings' && (
          <div>
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-4">
              <p className="text-sm text-gray-500">{text.balance}</p>
              <p className="text-3xl font-bold text-gray-900">{balance.toLocaleString()} RWF</p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-green-50 rounded-xl p-3"><p className="text-xs text-gray-500">{text.totalEarned}</p><p className="text-lg font-bold text-green-700">{totalEarned.toLocaleString()} RWF</p></div>
                <div className="bg-red-50 rounded-xl p-3"><p className="text-xs text-gray-500">{text.totalWithdrawn}</p><p className="text-lg font-bold text-red-700">{totalWithdrawn.toLocaleString()} RWF</p></div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowDepositModal(true)} className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700 transition">{text.deposit}</button>
                <button onClick={() => setShowWithdrawModal(true)} className="flex-1 bg-green-600 text-white rounded-xl py-3 font-medium hover:bg-green-700 transition">{text.withdraw}</button>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2">{text.level}</h3>
              <div className="flex justify-between items-center"><span>L{level}</span><span className={`px-3 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{isActive ? text.active : text.inactive}</span></div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2"><div className="bg-purple-600 h-2 rounded-full" style={{ width: `${level ? 20 : 0}%` }}></div></div>
              <p className="text-xs text-gray-400 mt-1">{text.daysLeft}: {levelExpiry ? Math.ceil((new Date(levelExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 'N/A'} days</p>
            </div>
          </div>
        )}

        {activeTab === 'referrals' && (
          <div>
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 mb-4">
              <h3 className="font-bold text-gray-900 mb-2">{text.referralCode}</h3>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                <code className="flex-1 font-mono text-blue-600">{referralCode}</code>
                <button onClick={() => handleCopy(referralCode)} className="p-2 text-gray-500 hover:text-blue-600 transition">{copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}</button>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="flex-1 bg-gray-100 rounded-xl py-2 text-sm flex items-center justify-center gap-1 hover:bg-gray-200 transition"><Users className="w-4 h-4" /> {text.share}</button>
                <button onClick={() => handleCopy(`${window.location.origin}/register?ref=${referralCode}`)} className="flex-1 bg-blue-100 text-blue-700 rounded-xl py-2 text-sm flex items-center justify-center gap-1 hover:bg-blue-200 transition"><Copy className="w-4 h-4" /> {text.copy}</button>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 mb-4 flex flex-col items-center">
              <h4 className="font-medium text-gray-700 mb-2">QR Code</h4>
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <QRCodeCanvas value={`${window.location.origin}/register?ref=${referralCode}`} size={150} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100"><p className="text-sm text-gray-500">{text.active}</p><p className="text-2xl font-bold text-green-600">{referralsData.active}</p></div>
              <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100"><p className="text-sm text-gray-500">{text.inactive}</p><p className="text-2xl font-bold text-red-400">{referralsData.inactive}</p></div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
              <h4 className="font-medium text-gray-700 mb-2">{text.direct}</h4>
              <div className="flex justify-between items-center"><span className="text-sm">{referralsData.direct} people</span><span className="text-sm font-medium text-blue-600">{referralsData.direct > 0 ? '✅' : '❌'}</span></div>
              <h4 className="font-medium text-gray-700 mt-3 mb-2">{text.indirect}</h4>
              <div className="flex justify-between items-center"><span className="text-sm">{referralsData.indirect} people</span><span className="text-sm font-medium text-blue-600">{referralsData.indirect > 0 ? '✅' : '❌'}</span></div>
              <div className="mt-3 pt-3 border-t border-gray-200"><p className="text-xs text-gray-400">7% • 5% • 3% {text.direct}</p></div>
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div>
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 mb-4">
              <h3 className="font-bold text-gray-900 mb-2">{text.yourLevel}</h3>
              <div className="flex justify-between items-center"><span className="text-lg">L{level}</span><span className={`px-3 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{isActive ? text.active : text.inactive}</span></div>
              <button onClick={() => setShowBuyModal(true)} className="w-full mt-3 bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200"><Plus className="w-4 h-4" /> {text.buyLevel}</button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2">{text.account}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Name</span><span>{name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Phone</span><span>{phone}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Referral Code</span><span className="font-mono">{referralCode}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={isActive ? 'text-green-600' : 'text-yellow-600'}>{isActive ? text.active : text.inactive}</span></div>
              </div>
              <button onClick={handleLogout} className="w-full mt-4 bg-red-50 text-red-600 rounded-xl py-3 font-medium hover:bg-red-100 transition flex items-center justify-center gap-2"><LogOut className="w-4 h-4" /> Logout</button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)} className={activeTab === tab.id ? 'active' : ''}>
            <tab.icon />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Task Popup */}
      {showTaskPopup && currentTask && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-w-md p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">{currentTask.name}</h2>
              <button onClick={() => setShowTaskPopup(false)} className="p-2 text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>

            {taskError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {taskError}
              </div>
            )}

            {taskStep === 'select' && (
              <div className="text-center py-4">
                <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-2xl shadow-md flex items-center justify-center overflow-hidden">
                  <AppLogo name={currentTask.name} domain={currentTask.domain} className="w-20 h-20" />
                </div>
                <p className="text-gray-600 mb-2">{currentTask.description}</p>
                <p className="text-sm text-gray-500">Reward: <span className="font-bold text-green-600">{perTaskReward} RWF</span></p>
                <button onClick={handleInstall} className="w-full mt-4 bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"><Download className="w-5 h-5" /> {text.installApp}</button>
              </div>
            )}

            {taskStep === 'install' && (
              <div className="text-center py-8">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <Smartphone className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <h3 className="font-bold text-gray-900">Installing {currentTask.name}...</h3>
                <p className="text-sm text-gray-500 mt-2">3 seconds remaining</p>
              </div>
            )}

            {taskStep === 'test' && (
              <div className="text-center py-8">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin-slow"></div>
                    <RefreshCw className="w-8 h-8 text-green-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <h3 className="font-bold text-gray-900">Testing {currentTask.name}...</h3>
                <p className="text-sm text-gray-500 mt-2">Please wait 5 seconds</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div className="bg-green-500 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                </div>
              </div>
            )}

            {taskStep === 'done' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8 text-green-600" /></div>
                <h3 className="font-bold text-gray-900">✅ Task Complete!</h3>
                <p className="text-lg font-bold text-green-600 mt-2">+{perTaskReward} RWF</p>
                <button onClick={() => { setShowTaskPopup(false); setCurrentTask(null); setTaskStep('select'); }} className="w-full mt-4 bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700 transition">{text.close}</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Buy Level Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-gray-900">{text.buyLevelTitle}</h2><button onClick={() => setShowBuyModal(false)} className="p-2 text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button></div>
            <div className="mb-4 p-3 bg-gray-50 rounded-xl"><p className="text-sm text-gray-600">{text.yourBalance}: <span className="font-bold text-blue-600">{balance.toLocaleString()} RWF</span></p></div>
            {buyError && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {buyError}</div>}
            {levels.length === 0 ? <p className="text-center text-gray-500 py-4">{text.noTasks}</p> : (
              <div className="space-y-3">
                {levels.map((level, index) => {
                  const canAfford = balance >= level.price
                  return (
                    <div key={level._id || `level-${level.level}-${index}`} className={`border rounded-xl p-4 ${canAfford ? 'border-gray-200' : 'border-gray-200 opacity-60'}`}>
                      <div className="flex justify-between items-start">
                        <div><h4 className="font-bold text-gray-900">{level.displayName || `Level ${level.level}`}</h4><p className="text-sm text-gray-500">{level.dailyTasks} tasks/day • {level.dailyReturn}% return</p><p className="text-sm text-gray-500">{level.durationDays} days</p></div>
                        <div className="text-right"><p className="font-bold text-blue-600">{level.price.toLocaleString()} RWF</p>{!canAfford && <p className="text-xs text-red-500">{text.insufficientBalance}</p>}</div>
                      </div>
                      <button onClick={() => handleBuyLevel(level.level)} disabled={!canAfford || buyLoading} className={`w-full mt-2 rounded-xl py-2 font-medium transition ${canAfford ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>{buyLoading ? text.processing : text.purchase}</button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Spin Modal */}
      {showSpinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-gray-900">{text.spinTitle}</h2><button onClick={() => setShowSpinModal(false)} className="p-2 text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button></div>
            <div className="flex justify-center"><canvas ref={canvasRef} width={300} height={300} className="w-full max-w-xs aspect-square"></canvas></div>
            {spinResult && (
              <div className="mt-4 p-3 bg-gray-50 rounded-xl text-center">
                <p className="text-sm font-medium">{spinResult.rewardMessage}</p>
                {spinResult.prize.type === 'cash' && <p className="text-lg font-bold text-green-600">+{spinResult.prize.value} RWF</p>}
              </div>
            )}
            <button onClick={spinWheel} disabled={spinning || spinsAvailable <= 0} className="w-full mt-4 bg-orange-500 text-white rounded-xl py-3 font-medium hover:bg-orange-600 transition disabled:opacity-50">{spinning ? text.spinning : text.spinButton}</button>
            <p className="text-xs text-gray-400 text-center mt-2">{text.spins}: {spinsAvailable}</p>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">{text.depositTitle}</h2>
              <button onClick={() => setShowDepositModal(false)} className="p-2 text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
              <p>💰 {text.feeInfo}: 5%</p>
              <p>⏱️ {text.timeLimit}</p>
              <p>{text.minimumDeposit}</p>
            </div>

            {depositError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {depositError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{text.amount} (RWF)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="1000 minimum"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  min="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{text.fullName}</label>
                <input
                  type="text"
                  value={depositName}
                  onChange={(e) => setDepositName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{text.phoneNumber}</label>
                <input
                  type="tel"
                  value={depositPhone}
                  onChange={(e) => setDepositPhone(e.target.value)}
                  placeholder="0788123456"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">MTN or Airtel Money number</p>
              </div>
            </div>

            <button
              onClick={handleDeposit}
              disabled={depositLoading}
              className="w-full mt-4 py-3.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {depositLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {text.processing}
                </>
              ) : (
                text.deposit
              )}
            </button>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">{text.withdrawTitle}</h2>
              <button onClick={() => setShowWithdrawModal(false)} className="p-2 text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>

            <div className="mb-4 p-3 bg-green-50 rounded-xl text-sm text-green-700">
              <p>💰 {text.feeInfo}: 5%</p>
              <p>⏱️ {text.approveWait}</p>
              <p>{text.minimumDeposit}</p>
            </div>

            {withdrawError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {withdrawError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{text.amount} (RWF)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="1000 minimum"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  min="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{text.fullName}</label>
                <input
                  type="text"
                  value={withdrawName}
                  onChange={(e) => setWithdrawName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{text.phoneNumber}</label>
                <input
                  type="tel"
                  value={withdrawPhone}
                  onChange={(e) => setWithdrawPhone(e.target.value)}
                  placeholder="0788123456"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{text.paymentMethod}</label>
                <select
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="mobile_money">{text.mobileMoney}</option>
                  <option value="bank_transfer">{text.bankTransfer}</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleWithdraw}
              disabled={withdrawLoading}
              className="w-full mt-4 py-3.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {withdrawLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {text.processing}
                </>
              ) : (
                text.withdraw
              )}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}