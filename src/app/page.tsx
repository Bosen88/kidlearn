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
      style={{ background: 'linear-gradient(160deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)' }}>

      {/* Decorative blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="text-8xl mb-3"
          >
            ⭐
          </motion.div>
          <h1 className="text-6xl font-black text-white tracking-tight"
            style={{ textShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
            KidSpark
          </h1>
          <p className="text-white/75 text-lg font-bold mt-2">邊玩邊學，每天都進步！</p>
        </div>

        {/* Characters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-8 mb-8"
        >
          {(['peep', 'hoppy', 'luna'] as const).map((char, i) => (
            <div key={char} className="flex flex-col items-center gap-2">
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ repeat: Infinity, duration: 2.2, delay: i * 0.35, ease: 'easeInOut' }}
              >
                <CharacterSprite character={char} mood="happy" size={64} />
              </motion.div>
              <span className="text-white/60 text-xs font-bold uppercase tracking-wider">
                {char === 'peep' ? 'Peep' : char === 'hoppy' ? 'Hoppy' : 'Luna'}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          {['🦷 生活習慣', '🔤 英文學習', '🧠 認知訓練', '⭐ 獎勵'].map((tag) => (
            <span key={tag}
              className="glass-pill text-white font-bold px-4 py-2 rounded-full text-sm">
              {tag}
            </span>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-3"
        >
          {parentSettings ? (
            <>
              <BigButton color="#f59e0b" onClick={() => setShowChildSelect(true)}
                className="w-full text-gray-900 font-black text-xl py-5">
                🎮 開始遊戲
              </BigButton>
              <button onClick={() => router.push('/parent')}
                className="text-white/60 text-sm font-semibold text-center py-2 hover:text-white/90 transition-colors">
                ⚙️ 家長後台管理
              </button>
            </>
          ) : (
            <>
              <BigButton color="#f59e0b" onClick={() => router.push('/auth/register')}
                className="w-full text-gray-900 font-black text-xl py-5">
                🚀 免費開始
              </BigButton>
              <button onClick={() => router.push('/auth/login')}
                className="text-white/60 text-sm font-semibold text-center py-2 hover:text-white/90 transition-colors">
                已有帳號？登入
              </button>
            </>
          )}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showChildSelect && parentSettings && (
          <ChildSelectModal
            children={parentSettings.children}
            onSelect={(child) => {
              setCurrentChild(child)
              startSession(child.id)
              router.push('/game')
            }}
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="bg-white rounded-[2rem] p-7 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-black text-center text-gray-800 mb-1">我是誰？</h2>
        <p className="text-gray-400 text-center text-sm font-semibold mb-6">點選你的小夥伴！</p>

        <div className="grid grid-cols-2 gap-3">
          {children.map((child) => (
            <motion.button
              key={child.id}
              onClick={() => onSelect(child)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="bg-gradient-to-b from-purple-50 to-indigo-50 rounded-2xl p-5 flex flex-col items-center gap-2 border-2 border-purple-100"
              style={{ boxShadow: '0 4px 0 #c4b5fd' }}
            >
              <div className="text-5xl">{child.avatar || '😊'}</div>
              <span className="font-black text-gray-800 text-lg">{child.name}</span>
              <div className="flex items-center gap-1 bg-yellow-100 rounded-full px-3 py-1">
                <span className="text-yellow-500 font-black text-sm">⭐ {child.stars}</span>
              </div>
            </motion.button>
          ))}

          <motion.button
            onClick={onAddChild}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="rounded-2xl p-5 flex flex-col items-center gap-2 border-2 border-dashed border-gray-200 hover:border-purple-300 transition-colors"
          >
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
      style={{ background: 'linear-gradient(160deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)' }}>
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
        transition={{ rotate: { repeat: Infinity, duration: 1.5, ease: 'linear' }, scale: { repeat: Infinity, duration: 1.5 } }}
        className="text-7xl"
      >
        ⭐
      </motion.div>
      <p className="text-white/70 font-bold text-xl mt-5">載入中...</p>
    </div>
  )
}
