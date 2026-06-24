import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'secret'

export const hashPassword = (p: string) => bcrypt.hash(p, 10)
export const comparePassword = (p: string, h: string) => bcrypt.compare(p, h)
export const generateToken = (id: string) => jwt.sign({ id }, SECRET, { expiresIn: '7d' })
export const verifyToken = (t: string) => { try { return jwt.verify(t, SECRET) as { id: string } } catch { return null } }