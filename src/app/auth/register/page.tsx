'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { createParentSettings } from '@/lib/firestoreService'
import { useRouter } from 'next/navigation'
import BigButton from '@/components/ui/BigButton'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const register = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) { setError('密碼至少需要 6 個字元'); return }
    setLoading(true)
    setError('')
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      await createParentSettings(user.uid, email)
      router.push('/parent/children')
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      if (code === 'auth/email-already-in-use') {
        setError('此信箱已被註冊，請直接登入')
      } else if (code === 'auth/operation-not-allowed') {
        setError('請先到 Firebase Console 開啟 Email 登入功能')
      } else if (code === 'auth/weak-password') {
        setError('密碼強度不足，請使用至少 6 個字元')
      } else {
        setError(`註冊失敗：${code || String(err)}`)
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
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-3">🚀</div>
          <h1 className="text-4xl font-black text-white tracking-tight"
            style={{ textShadow: '0 3px 0 rgba(0,0,0,0.2)' }}>
            建立帳號
          </h1>
          <p className="text-white/70 font-semibold mt-1">免費讓孩子開始學習</p>
        </div>

        <div className="bg-white rounded-3xl p-7 shadow-2xl">
          <form onSubmit={register} className="space-y-5">
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

            <div>
              <label className="block text-sm font-bold text-gray-500 mb-2 tracking-wide uppercase">
                密碼（至少 6 個字元）
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 pr-12 text-gray-800 font-semibold text-base focus:outline-none focus:border-purple-400 focus:bg-white transition-all placeholder:text-gray-300"
                  placeholder="設定密碼"
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
              {/* Password strength */}
              {password.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-1.5 flex-1 rounded-full transition-colors"
                      style={{
                        backgroundColor:
                          password.length >= i * 4
                            ? i === 1 ? '#f97316' : i === 2 ? '#fbbf24' : '#22c55e'
                            : '#e5e7eb',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

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

            <BigButton color="#7c3aed" disabled={loading} className="w-full text-lg py-4">
              {loading ? '建立中...' : '建立帳號 🎉'}
            </BigButton>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm font-medium">
              已有帳號？{' '}
              <button
                onClick={() => router.push('/auth/login')}
                className="text-purple-600 font-bold hover:text-purple-700 transition-colors"
              >
                立即登入
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
