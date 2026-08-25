import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

// Simple connection - no caching for now
export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured')
  }

  console.log('🔗 Connecting to MongoDB from Next.js...')
  
  // If already connected, return
  if (mongoose.connection.readyState === 1) {
    console.log('✅ Already connected')
    return mongoose.connection
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    })
    console.log('✅ MongoDB connected successfully')
    console.log(`📊 Database: ${mongoose.connection.db?.databaseName}`)
    return mongoose.connection
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error.message)
    throw error
  }
}