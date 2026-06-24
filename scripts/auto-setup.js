const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const uri = process.env.MONGODB_URI

if (!uri) {
  console.error('❌ MONGODB_URI not found in .env.local')
  process.exit(1)
}

async function autoSetup() {
  console.log('🚀 Starting automatic database setup...')
  console.log(`📡 Connecting to: ${uri.replace(/\/\/(.*):(.*)@/, '//USER:PASSWORD@')}`)
  
  try {
    // Connect to MongoDB
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    })
    console.log('✅ Connected to MongoDB')
    
    const db = mongoose.connection.db
    console.log(`📊 Database: ${db.databaseName}`)
    
    // ============================================
    // 1. CREATE COLLECTIONS
    // ============================================
    console.log('\n📁 Creating collections...')
    
    const collections = ['users', 'levels', 'wallets', 'transactions', 'commissions', 'tasks', 'luckyspins']
    
    for (const name of collections) {
      try {
        await db.createCollection(name)
        console.log(`   ✅ Created: ${name}`)
      } catch (err) {
        // Collection might already exist
        if (err.code === 48) {
          console.log(`   ⚠️ Already exists: ${name}`)
        } else {
          console.log(`   ❌ Error creating ${name}:`, err.message)
        }
      }
    }
    
    // ============================================
    // 2. CHECK IF ADMIN EXISTS
    // ============================================
    console.log('\n👤 Checking for admin user...')
    const usersCollection = db.collection('users')
    const existingAdmin = await usersCollection.findOne({ phone: '0780000000' })
    
    if (existingAdmin) {
      console.log('⚠️ Admin already exists!')
      console.log(`   📱 Phone: ${existingAdmin.phone}`)
      console.log(`   🔗 Referral Code: ${existingAdmin.referralCode}`)
    } else {
      // ============================================
      // 3. CREATE ADMIN USER
      // ============================================
      console.log('👤 Creating admin user...')
      
      const hashedPassword = await bcrypt.hash('Admin1234!', 10)
      
      const admin = {
        name: 'Admin',
        phone: '0780000000',
        password: hashedPassword,
        referralCode: 'REFADMIN',
        isAdmin: true,
        isActive: true,
        level: 0,
        balance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        referrals: { direct: 0, indirect: 0 },
        createdAt: new Date(),
      }
      
      const result = await usersCollection.insertOne(admin)
      console.log(`   ✅ Admin created with ID: ${result.insertedId}`)
      
      // ============================================
      // 4. CREATE WALLET FOR ADMIN
      // ============================================
      console.log('💰 Creating admin wallet...')
      const walletsCollection = db.collection('wallets')
      
      const wallet = {
        userId: result.insertedId,
        balance: 0,
        frozenBalance: 0,
        currency: 'RWF',
        totalWithdrawn: 0,
        createdAt: new Date(),
      }
      
      await walletsCollection.insertOne(wallet)
      console.log('   ✅ Wallet created')
    }
    
    // ============================================
    // 5. CREATE LEVELS
    // ============================================
    console.log('\n📊 Creating levels...')
    const levelsCollection = db.collection('levels')
    
    const levelCount = await levelsCollection.countDocuments()
    if (levelCount > 0) {
      console.log(`⚠️ ${levelCount} levels already exist`)
    } else {
      const levels = [
        { level: 1, price: 15000, dailyTasks: 6, dailyReturn: 2.5, durationDays: 30, isActive: true },
        { level: 2, price: 25000, dailyTasks: 12, dailyReturn: 3.0, durationDays: 30, isActive: true },
        { level: 3, price: 35000, dailyTasks: 20, dailyReturn: 3.5, durationDays: 30, isActive: true },
        { level: 4, price: 45000, dailyTasks: 30, dailyReturn: 4.0, durationDays: 30, isActive: true },
        { level: 5, price: 55000, dailyTasks: 40, dailyReturn: 4.5, durationDays: 30, isActive: true },
      ]
      
      await levelsCollection.insertMany(levels)
      console.log(`   ✅ ${levels.length} levels created`)
      
      // Show levels
      const createdLevels = await levelsCollection.find().toArray()
      createdLevels.forEach(l => {
        console.log(`   L${l.level}: ${l.price} RWF, ${l.dailyTasks} tasks/day, ${l.dailyReturn}% return`)
      })
    }
    
    // ============================================
    // 6. SUMMARY
    // ============================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 SETUP COMPLETE!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const finalAdmin = await usersCollection.findOne({ phone: '0780000000' })
    if (finalAdmin) {
      console.log('📱 Admin Phone: 0780000000')
      console.log('🔑 Admin Password: Admin1234!')
      console.log(`🔗 Referral Code: ${finalAdmin.referralCode}`)
    }
    
    const finalLevels = await levelsCollection.find().toArray()
    console.log(`📊 Levels: ${finalLevels.length} created`)
    
    console.log('\n📝 Next Steps:')
    console.log('1. Restart your server: Ctrl+C then npm run dev')
    console.log('2. Login with: 0780000000 / Admin1234!')
    console.log('3. Visit: http://localhost:3000')
    
    await mongoose.disconnect()
    console.log('\n✅ Disconnected from MongoDB')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    console.error(error)
    process.exit(1)
  }
}

autoSetup()