const mongoose = require('mongoose')
const path = require('path')

// Load .env.local from the parent folder (root)
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const uri = process.env.MONGODB_URI

console.log('🔍 Looking for .env.local in:', path.join(__dirname, '..', '.env.local'))
console.log('MONGODB_URI exists:', !!uri)
console.log('MONGODB_URI length:', uri ? uri.length : 0)

if (!uri) {
  console.error('\n❌ MONGODB_URI not found in .env.local')
  console.log('\n💡 Check that .env.local exists in: C:\\Users\\PC\\Desktop\\kglc\\.env.local')
  console.log('💡 And contains: MONGODB_URI=mongodb+srv://...')
  process.exit(1)
}

console.log('\n📡 Connection string starts with:', uri.substring(0, 30) + '...')

async function test() {
  try {
    console.log('\n🔗 Attempting to connect...')
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    })
    
    console.log('✅ Connected successfully!')
    console.log(`📊 Database: ${mongoose.connection.db?.databaseName}`)
    
    const collections = await mongoose.connection.db?.listCollections().toArray()
    console.log(`📁 Collections: ${collections?.map(c => c.name).join(', ') || 'none'}`)
    
    await mongoose.disconnect()
    console.log('✅ Disconnected')
    process.exit(0)
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    console.error('\n💡 Common fixes:')
    console.log('1. Check your username and password in .env.local')
    console.log('2. URL-encode special characters in password (@ → %40, # → %23)')
    console.log('3. Make sure IP is whitelisted in MongoDB Atlas Network Access')
    process.exit(1)
  }
}

test()