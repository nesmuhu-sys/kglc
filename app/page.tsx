'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, Key, User, UserPlus, LogIn, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'

const t = {
  rw: {
    title: 'KGLC',
    subtitle: 'Akazi Platform',
    login: 'Kwinjira',
    register: 'Kwiyandikisha',
    name: 'Izina',
    phone: 'Numero (07XXXXXXXX)',
    referral: 'Kode yo Gutumira',
    password: 'Ijambo ryibanga (inyuguti 8+)',
    confirm: 'Emeza Ijambo',
    loginBtn: 'Kwinjira',
    registerBtn: 'Kwiyandikisha',
    noAccount: 'Nta konti ufite?',
    hasAccount: 'Ufite konti?',
    registerHere: 'Iyandikishe hano',
    loginHere: 'Injira hano',
    terms: 'Mugutekomeza, wemerera amategeko yacu',
    processing: 'Birakora...',
    errors: {
      invalidPhone: 'Andika numero ikwiye (0788888888)',
      shortPassword: 'Ijambo ryibanga rigomba kuba inyuguti 8',
      passwordMismatch: 'Amajambo ntabwo ahuje',
      nameRequired: 'Izina rirakenewe',
      codeRequired: 'Kode yo gutumira irakenewe',
      registerFailed: 'Kwiyandikisha byananiwe',
      loginFailed: 'Amakuru ntabwo ari yo',
    }
  },
  en: {
    title: 'KGLC',
    subtitle: 'Task Platform',
    login: 'Login',
    register: 'Register',
    name: 'Full Name',
    phone: 'Phone (07XXXXXXXX)',
    referral: 'Referral Code',
    password: 'Password (8+ chars)',
    confirm: 'Confirm Password',
    loginBtn: 'Login',
    registerBtn: 'Create Account',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    registerHere: 'Register here',
    loginHere: 'Login here',
    terms: 'By continuing, you agree to our Terms of Service',
    processing: 'Processing...',
    errors: {
      invalidPhone: 'Enter valid phone (0788888888)',
      shortPassword: 'Password must be at least 8 characters',
      passwordMismatch: 'Passwords do not match',
      nameRequired: 'Name is required',
      codeRequired: 'Referral code is required',
      registerFailed: 'Registration failed',
      loginFailed: 'Invalid credentials',
    }
  }
}

export default function Home() {
  const router = useRouter()
  const [lang, setLang] = useState<'rw' | 'en'>('rw')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ name: '', phone: '', referralCode: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPass, setShowPass] = useState(false)

  const text = t[lang]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === 'phone') {
      const clean = value.replace(/\D/g, '').slice(0, 10)
      setForm({ ...form, [name]: clean })
    } else {
      setForm({ ...form, [name]: value })
    }
    setError('')
    setSuccess('')
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (!form.name) { setError(text.errors.nameRequired); setLoading(false); return }
    if (!/^07\d{8}$/.test(form.phone)) { setError(text.errors.invalidPhone); setLoading(false); return }
    if (form.password.length < 8) { setError(text.errors.shortPassword); setLoading(false); return }
    if (form.password !== form.confirm) { setError(text.errors.passwordMismatch); setLoading(false); return }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          referralCode: form.referralCode,
          password: form.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || text.errors.registerFailed)
      localStorage.setItem('token', data.token)
      setSuccess('Kwiyandikisha byagenze neza!')
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (!/^07\d{8}$/.test(form.phone)) { setError(text.errors.invalidPhone); setLoading(false); return }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || text.errors.loginFailed)
      localStorage.setItem('token', data.token)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo1.png" alt="KGLC" className="w-28 h-28 mx-auto mb-2 object-contain" />
          <h1 className="text-2xl font-bold text-gray-900">{text.title}</h1>
          <p className="text-gray-500 text-sm">{text.subtitle}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-50">
          {/* Language & Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button onClick={() => setLang(lang === 'rw' ? 'en' : 'rw')} className="text-sm text-blue-600">
              {lang === 'rw' ? 'EN' : 'RW'}
            </button>
            <div className="flex-1" />
            <button onClick={() => setMode('login')} className={`px-4 py-1 text-sm rounded-lg ${mode === 'login' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>
              {text.login}
            </button>
            <button onClick={() => setMode('register')} className={`px-4 py-1 text-sm rounded-lg ${mode === 'register' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>
              {text.register}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle size={18} /> {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle size={18} /> {success}
            </div>
          )}

          <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
            {mode === 'register' && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">{text.name}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Jean Paul" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" required />
                </div>
              </div>
            )}

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">{text.phone}</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="0788888888" maxLength={10} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" required />
              </div>
            </div>

            {mode === 'register' && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">{text.referral}</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input name="referralCode" value={form.referralCode} onChange={handleChange} placeholder="REFABCD" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none uppercase" />
                </div>
              </div>
            )}

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">{text.password}</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Min 8 characters" className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{text.confirm}</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type={showPass ? 'text' : 'password'} name="confirm" value={form.confirm} onChange={handleChange} placeholder="Confirm password" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" required />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl text-white font-medium bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-200 disabled:opacity-50 transition-all">
              {loading ? `${text.processing}...` : (mode === 'login' ? text.loginBtn : text.registerBtn)}
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              {mode === 'login' ? text.noAccount : text.hasAccount}
              <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); }} className="text-blue-600 font-medium ml-1">
                {mode === 'login' ? text.registerHere : text.loginHere}
              </button>
            </p>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">{text.terms}</p>
      </div>
    </main>
  )
}