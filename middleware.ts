import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function middleware(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1]
  const publicPaths = ['/', '/api/auth/login', '/api/auth/register', '/api/auth/setup']
  
  if (publicPaths.some(p => req.nextUrl.pathname.startsWith(p))) {
    return NextResponse.next()
  }

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

  return NextResponse.next()
}

export const config = { matcher: ['/dashboard/:path*', '/api/:path*'] }