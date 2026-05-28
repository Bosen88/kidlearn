'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getParentSettings, createParentSettings } from '@/lib/firestoreService'
import { useAppStore } from '@/lib/store'
import CharacterSprite from '@/components/ui/CharacterSprite'
import BigButton from '@/components/ui/BigButton'
import type { ChildProfile } from '@/lib/types'

export default function HomePage() {
  const router = useRouter()
  const { setParentSettings, setCurrentChild, parentSettings, startSession } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [showChildSelect, setShowChildSelect] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        let settings = await getParentSettings(user.uid)
        if (!settings) settings = await createParentSettings(user.uid, user.email ?? '')
        setParentSettings(settings)
        setLoading(false)
        if (settings.children.length > 0) setShowChildSelect(true)
      } else {
        setLoading(false)
      }
    })
    return () => unsub()
  }, [setParentSettings])

  if (loading) return <LoadingScreen />

  return (
    <div className="min-h-screen flex flex-col items-center justify-center overflow-hidden px-5 py-10"
      style={{ background: 'linear-gradient(160deg, #eef2ff 0%, #fdf4ff 100%)' }}>

      {/* Decorative circles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #c7d2fe, transparent 70%)' }} />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #fde68a, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #a78bfa, transparent 70%)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl mb-4 text-center"
          style={{ boxShadow: '0 8px 0 #c7d2fe, 0 16px 40px rgba(99,102,241,0.12)' }}>

          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, 6, -6, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="text-8xl mb-3"
          >
            ⭐
          </motion.div>

          <h1 className="text-5xl font-black text-indigo-700 tracking-tight">KidSpark</h1>
          <p className="text-gray-500 text-base font-bold mt-2">邊玩邊學，每天都進步！</p>

          {/* Characters */}
          <div className="flex justify-center gap-8 mt-6 mb-2">
            {(['peep', 'hoppy', 'luna'] as const).map((char, i) => (
              <div key={char} className="flex flex-col items-center gap-1">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2.2, delay: i * 0.35, ease: 'easeInOut' }}
                >
                  <CharacterSprite character={char} mood="happy" size={56} />
                </motion.div>
                <span className="text-gray-400 text-xs font-bold">
                  {char === 'peep' ? 'Peep' : char === 'hoppy' ? 'Hoppy' : 'Luna'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {[
            { icon: '🦷', label: '生活習慣', color: '#d1fae5', text: '#065f46' },
            { icon: '🔤', label: '英文學習', color: '#fef3c7', text: '#92400e' },
            { icon: '🧠', label: '認知訓練', color: '#ede9fe', text: '#5b21b6' },
            { icon: '⭐', label: '獎勵系統', color: '#fef9c3', text: '#713f12' },
          ].map((t) => (
            <span key={t.label}
              className="font-bold px-4 py-2 rounded-full text-sm"
              style={{ backgroundColor: t.color, color: t.text }}>
              {t.icon} {t.label}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3">
          {parentSettings ? (
            <>
              <BigButton color="#4f46e5" onClick={() => setShowChildSelect(true)}
                className="w-full font-black text-xl py-5">
                🎮 開始遊戲
              </BigButton>
              <button onClick={() => router.push('/parent')}
                className="text-indigo-500 text-sm font-bold text-center py-2 hover:text-indigo-700 transition-colors">
                ⚙️ 家長後台管理
              </button>
            </>
          ) : (
            <>
              <BigButton color="#4f46e5" onClick={() => router.push('/auth/register')}
                className="w-full font-black text-xl py-5">
                🚀 免費開始
              </BigButton>
              <button onClick={() => router.push('/auth/login')}
                className="text-indigo-500 text-sm font-bold text-center py-2 hover:text-indigo-700 transition-colors">
                已有帳號？登入
              </button>
            </>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showChildSelect && parentSettings && (
          <ChildSelectModal
            children={parentSettings.children}
            onSelect={(child) => { setCurrentChild(child); startSession(child.id); router.push('/game') }}
            onClose={() => setShowChildSelect(false)}
            onAddChild={() => router.push('/parent/children')}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function ChildSelectModal({ children, onSelect, onClose, onAddChild }: {
  children: ChildProfile[]
  onSelect: (c: ChildProfile) => void
  onClose: () => void
  onAddChild: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="bg-white rounded-[2rem] p-7 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-black text-center text-gray-800 mb-1">我是誰？</h2>
        <p className="text-gray-500 text-center text-sm font-semibold mb-6">點選你的小夥伴！</p>

        <div className="grid grid-cols-2 gap-3">
          {children.map((child) => (
            <motion.button key={child.id} onClick={() => onSelect(child)}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="bg-indigo-50 rounded-2xl p-5 flex flex-col items-center gap-2 border-2 border-indigo-100"
              style={{ boxShadow: '0 4px 0 #c7d2fe' }}>
              <div className="text-5xl">{child.avatar || '😊'}</div>
              <span className="font-black text-gray-800 text-lg">{child.name}</span>
              <div className="bg-yellow-100 rounded-full px-3 py-1">
                <span className="text-yellow-700 font-black text-sm">⭐ {child.stars}</span>
              </div>
            </motion.button>
          ))}

          <motion.button onClick={onAddChild}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className="rounded-2xl p-5 flex flex-col items-center gap-2 border-2 border-dashed border-gray-200 hover:border-indigo-300 transition-colors">
            <div className="text-5xl">➕</div>
            <span className="font-bold text-gray-400 text-sm">新增小朋友</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #eef2ff 0%, #fdf4ff 100%)' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        className="text-7xl"
      >⭐</motion.div>
      <p className="text-indigo-400 font-bold text-xl mt-5">載入中...</p>
    </div>
  )
}
