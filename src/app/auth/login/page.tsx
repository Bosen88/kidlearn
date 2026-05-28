'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import BigButton from '@/components/ui/BigButton'

const SAVED_EMAIL_KEY = 'kidlearn_saved_email'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(SAVED_EMAIL_KEY)
    if (saved) {
      setEmail(saved)
      setRemember(true)
    }
  }, [])

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      if (remember) {
        localStorage.setItem(SAVED_EMAIL_KEY, email)
      } else {
        localStorage.removeItem(SAVED_EMAIL_KEY)
      }
      router.push('/')
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      if (
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-credential'
      ) {
        setError('帳號或密碼錯誤，請再試一次')
      } else if (code === 'auth/too-many-requests') {
        setError('嘗試次數過多，請稍後再試')
      } else if (code === 'auth/operation-not-allowed') {
        setError('請先到 Firebase Console 開啟 Email 登入功能')
      } else {
        setError(`登入失敗：${code || String(err)}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5"
      style={{ background: 'linear-gradient(160deg, #667eea 0%, #764ba2 100%)' }}
    >
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="text-7xl mb-3"
          >
            ⭐
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tight"
            style={{ textShadow: '0 3px 0 rgba(0,0,0,0.2)' }}>
            KidSpark
          </h1>
          <p className="text-white/70 font-semibold mt-1">家長登入</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-7 shadow-2xl">
          <form onSubmit={login} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-2 tracking-wide uppercase">
                電子信箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-gray-800 font-semibold text-base focus:outline-none focus:border-purple-400 focus:bg-white transition-all placeholder:text-gray-300"
                placeholder="your@email.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-2 tracking-wide uppercase">
                密碼
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 pr-12 text-gray-800 font-semibold text-base focus:outline-none focus:border-purple-400 focus:bg-white transition-all placeholder:text-gray-300"
                  placeholder="••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-3 cursor-pointer select-none group">
              <div
                onClick={() => setRemember(!remember)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                  remember
                    ? 'bg-purple-500 border-purple-500'
                    : 'bg-white border-gray-200 group-hover:border-purple-300'
                }`}
              >
                {remember && <span className="text-white text-sm font-black">✓</span>}
              </div>
              <span className="text-gray-600 font-semibold text-sm">記住我的帳號</span>
            </label>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 flex items-start gap-2"
              >
                <span className="text-red-400 mt-0.5">⚠️</span>
                <p className="text-red-600 text-sm font-semibold">{error}</p>
              </motion.div>
            )}

            {/* Login Button */}
            <BigButton color="#7c3aed" disabled={loading} className="w-full text-lg py-4">
              {loading ? '登入中...' : '登入 →'}
            </BigButton>
          </form>

          {/* Register Link */}
          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm font-medium">
              還沒有帳號？{' '}
              <button
                onClick={() => router.push('/auth/register')}
                className="text-purple-600 font-bold hover:text-purple-700 transition-colors"
              >
                免費註冊
              </button>
            </p>
          </div>
        </div>

        <p className="text-white/40 text-xs text-center mt-6 font-medium">
          KidSpark © 2025 · 2-5歲兒童教育遊戲
        </p>
      </motion.div>
    </div>
  )
}
