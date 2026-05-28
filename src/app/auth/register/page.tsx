'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { createParentSettings } from '@/lib/firestoreService'
import { useRouter } from 'next/navigation'
import BigButton from '@/components/ui/BigButton'
import FloatingElements from '@/components/FloatingElements'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const register = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) { setError('密碼至少需要6個字元'); return }
    setLoading(true)
    setError('')
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      await createParentSettings(user.uid, email)
      router.push('/parent/children')
    } catch {
      setError('註冊失敗，請確認信箱格式或換一組信箱')
    } finally {
      setLoading(false)
    }
  }

  const googleRegister = async () => {
    setLoading(true)
    try {
      const { user } = await signInWithPopup(auth, new GoogleAuthProvider())
      await createParentSettings(user.uid, user.email ?? '')
      router.push('/parent/children')
    } catch {
      setError('Google 登入失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <FloatingElements />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl relative z-10"
      >
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">🚀</div>
          <h1 className="text-3xl font-black text-purple-600">建立帳號</h1>
          <p className="text-gray-400 text-sm mt-1">免費，讓孩子開始學習！</p>
        </div>

        <form onSubmit={register} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">電子信箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-purple-100 rounded-2xl px-4 py-3 text-gray-700 font-medium focus:outline-none focus:border-purple-400 transition-colors"
              placeholder="parent@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">密碼（至少6個字元）</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-purple-100 rounded-2xl px-4 py-3 text-gray-700 font-medium focus:outline-none focus:border-purple-400 transition-colors"
              placeholder="設定密碼"
              required
            />
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm text-center font-medium">
              {error}
            </motion.p>
          )}

          <BigButton color="#a855f7" disabled={loading} className="w-full">
            {loading ? '建立中...' : '建立帳號 🎉'}
          </BigButton>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-gray-300 text-sm">或</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <motion.button
          onClick={googleRegister}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 font-bold text-gray-600 flex items-center justify-center gap-2 hover:border-gray-200 transition-colors"
        >
          <span className="text-xl">🌐</span> 用 Google 快速註冊
        </motion.button>

        <p className="text-center text-gray-400 text-sm mt-6">
          已有帳號？{' '}
          <button onClick={() => router.push('/auth/login')} className="text-purple-500 font-bold">
            立即登入
          </button>
        </p>
      </motion.div>
    </div>
  )
}
