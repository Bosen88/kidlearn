'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getParentSettings, createParentSettings } from '@/lib/firestoreService'
import { useAppStore } from '@/lib/store'
import FloatingElements from '@/components/FloatingElements'
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
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden">
      <FloatingElements />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center px-6 py-8 max-w-lg w-full"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0], y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="text-8xl mb-2"
        >
          ⭐
        </motion.div>

        <motion.h1
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="text-6xl font-black text-white drop-shadow-lg tracking-tight"
          style={{ textShadow: '0 4px 0 rgba(0,0,0,0.15)' }}
        >
          KidSpark
        </motion.h1>
        <p className="text-white/80 text-xl font-bold mt-1">邊玩邊學，每天都進步！</p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-6 my-8"
        >
          {(['peep', 'hoppy', 'luna'] as const).map((char, i) => (
            <motion.div
              key={char}
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.3, ease: 'easeInOut' }}
            >
              <CharacterSprite character={char} mood="happy" size={70} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          {['🦷 生活習慣', '🔤 英文學習', '🧠 認知訓練', '⭐ 獎勵系統', '👨‍👩‍👧 家長管理'].map((tag) => (
            <span key={tag} className="bg-white/30 backdrop-blur text-white font-bold px-4 py-1.5 rounded-full text-sm">
              {tag}
            </span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col gap-4 items-center"
        >
          {parentSettings ? (
            <>
              <BigButton color="#ffd93d" onClick={() => setShowChildSelect(true)} className="w-full text-gray-800">
                🎮 開始遊戲
              </BigButton>
              <button
                onClick={() => router.push('/parent')}
                className="text-white/70 underline text-sm font-medium"
              >
                家長後台管理
              </button>
            </>
          ) : (
            <>
              <BigButton color="#ffd93d" onClick={() => router.push('/auth/register')} className="w-full text-gray-800">
                🚀 免費開始
              </BigButton>
              <button
                onClick={() => router.push('/auth/login')}
                className="text-white/70 underline text-sm font-medium"
              >
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

function ChildSelectModal({
  children,
  onSelect,
  onClose,
  onAddChild,
}: {
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
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-black text-center text-purple-600 mb-2">我是誰？</h2>
        <p className="text-gray-400 text-center text-sm mb-6">選擇你的小夥伴！</p>

        <div className="grid grid-cols-2 gap-3">
          {children.map((child) => (
            <motion.button
              key={child.id}
              onClick={() => onSelect(child)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="game-card p-4 flex flex-col items-center gap-2"
            >
              <div className="text-5xl">{child.avatar || '😊'}</div>
              <span className="font-black text-gray-700 text-lg">{child.name}</span>
              <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                ⭐ {child.stars}
              </div>
            </motion.button>
          ))}

          <motion.button
            onClick={onAddChild}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="game-card p-4 flex flex-col items-center gap-2 border-2 border-dashed border-purple-200"
          >
            <div className="text-5xl">➕</div>
            <span className="font-bold text-purple-400 text-sm">新增小朋友</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="text-7xl"
      >
        ⭐
      </motion.div>
      <p className="text-white/80 font-bold text-xl mt-4">載入中...</p>
    </div>
  )
}
