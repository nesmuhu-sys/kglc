// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1] || 
                req.cookies.get('token')?.value

  const publicPaths = ['/', '/api/auth/login', '/api/auth/register', '/api/auth/setup']
  const isPublicPath = publicPaths.some(p => req.nextUrl.pathname.startsWith(p))

  // If public, allow
  if (isPublicPath) {
    return NextResponse.next()
  }

  // If no token, redirect to login (for pages) or return 401 (for API)
  if (!token) {
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/', req.url))
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/', req.url))
  }

  // For admin routes, check if user is admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const { connectDB } = await import('@/lib/db')
    const { User } = await import('@/lib/models')
    await connectDB()
    const user = await User.findById(decoded.id)
    if (!user || !user.isAdmin) {
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/:path*'],
}