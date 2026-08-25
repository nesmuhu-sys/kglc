import mongoose, { Schema } from 'mongoose'

// User Model
const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  referralCode: { type: String, unique: true, uppercase: true },
  referredBy: { type: Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  level: { type: Number, default: 0 },
  levelExpiry: { type: Date },
  dailyTasksCompleted: { type: Number, default: 0 },
  spinsAvailable: { type: Number, default: 0 },
  lastTaskResetDate: { type: String }, // Add this – stores date as YYYY-MM-DD
  balance: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  totalWithdrawn: { type: Number, default: 0 },
  referrals: {
    direct: { type: Number, default: 0 },
    indirect: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
})

// Auto-generate referral code
UserSchema.pre('save', async function() {
  if (this.referralCode) return
  let code = 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase()
  let exists = await mongoose.model('User').findOne({ referralCode: code })
  let attempts = 0
  while (exists && attempts < 10) {
    code = 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase()
    exists = await mongoose.model('User').findOne({ referralCode: code })
    attempts++
  }
  this.referralCode = code
})

// Level Model
const LevelSchema = new Schema({
  level: { type: Number, required: true, unique: true },
  price: { type: Number, required: true },
  dailyTasks: { type: Number, required: true },
  dailyReturn: { type: Number, required: true },
  durationDays: { type: Number, default: 30 },
  isActive: { type: Boolean, default: true },
})

// Wallet Model
const WalletSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: Number, default: 0 },
  frozenBalance: { type: Number, default: 0 },
  currency: { type: String, default: 'RWF' },
  totalWithdrawn: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
})

// Transaction Model
const TransactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['deposit', 'withdrawal', 'task_earning', 'commission', 'level_purchase', 'spin_bonus'] },
  amount: { type: Number, required: true },
  fee: { type: Number, default: 0 },
  netAmount: { type: Number, default: 0 },
  metadata: { type: Schema.Types.Mixed, default: {} },
  balanceBefore: { type: Number },
  balanceAfter: { type: Number },
  description: { type: String },
  status: { type: String, default: 'completed' },
  reference: { type: String },
  createdAt: { type: Date, default: Date.now },
})

// Commission Model
const CommissionSchema = new Schema({
  referrerId: { type: Schema.Types.ObjectId, ref: 'User' },
  referredId: { type: Schema.Types.ObjectId, ref: 'User' },
  level: { type: Number },
  amount: { type: Number },
  commissionType: { type: String, enum: ['direct', 'indirect', 'bonus'] },
  rate: { type: Number },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
})

// Lucky Spin Model
const LuckySpinSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  referralId: { type: Schema.Types.ObjectId, ref: 'User' },
  reward: { type: String },
  rewardValue: { type: Number, default: 0 },
  isUsed: { type: Boolean, default: false },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
})

// Task Model
const TaskSchema = new Schema({
  title: { type: String, required: true },
  appName: { type: String, required: true },
  appLogo: { type: String },
  appLink: { type: String },
  description: { type: String },
  instructions: { type: String },
  level: { type: Number, required: true },
  reward: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  totalAvailable: { type: Number, default: 0 },
  remaining: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
})

// Export models
export const User = mongoose.models.User || mongoose.model('User', UserSchema)
export const Level = mongoose.models.Level || mongoose.model('Level', LevelSchema)
export const Wallet = mongoose.models.Wallet || mongoose.model('Wallet', WalletSchema)
export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema)
export const Commission = mongoose.models.Commission || mongoose.model('Commission', CommissionSchema)
export const LuckySpin = mongoose.models.LuckySpin || mongoose.model('LuckySpin', LuckySpinSchema)
export const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema)