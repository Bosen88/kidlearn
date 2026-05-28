'use client'
import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import CharacterSprite from '@/components/ui/CharacterSprite'
import BigButton from '@/components/ui/BigButton'
import type { GameLevel } from '@/lib/types'

interface Props {
  level: GameLevel
  children: ReactNode
  onComplete: (stars: number) => void
  completed?: boolean
  stars?: number
  hint?: string
}

export default function GameShell({ level, children, onComplete, completed, stars = 0, hint }: Props) {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <button
          onClick={() => router.push('/game')}
          className="bg-white/40 backdrop-blur rounded-2xl px-4 py-2 font-bold text-white text-sm"
        >
          ← 返回
        </button>
        <div className="flex-1 bg-white/30 backdrop-blur rounded-2xl px-4 py-2">
          <p className="text-white font-black text-lg leading-tight">{level.title}</p>
          <p className="text-white/70 text-xs">{level.description}</p>
        </div>
        <CharacterSprite character={level.character} mood="happy" size={50} />
      </div>

      {/* Hint */}
      {hint && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-5 mb-3 bg-white/30 backdrop-blur rounded-2xl px-4 py-2"
        >
          <p className="text-white font-bold text-center">{hint}</p>
        </motion.div>
      )}

      {/* Game Content */}
      <div className="flex-1 relative z-10 px-4 pb-4">
        {children}
      </div>

      {/* Complete Button when done */}
      {completed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 pb-6"
        >
          <BigButton color="#ffd93d" onClick={() => onComplete(stars)} className="w-full text-gray-800 text-2xl">
            完成！拿走 {stars} ⭐
          </BigButton>
        </motion.div>
      )}
    </div>
  )
}
