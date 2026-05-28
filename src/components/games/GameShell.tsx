'use client'
import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import CharacterSprite from '@/components/ui/CharacterSprite'
import BigButton from '@/components/ui/BigButton'
import type { GameLevel } from '@/lib/types'

const BG = 'linear-gradient(160deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)'

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
    <div className="min-h-screen flex flex-col" style={{ background: BG }}>
      {/* Header */}
      <div className="sticky top-0 z-20 px-4 pt-5 pb-3"
        style={{ background: 'rgba(30,27,75,0.85)', backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button
            onClick={() => router.push('/game')}
            className="flex-shrink-0 bg-white/15 hover:bg-white/25 text-white font-bold rounded-2xl px-4 py-2.5 text-sm transition-colors"
          >
            ← 返回
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-lg leading-tight truncate">{level.title}</p>
            <p className="text-white/60 text-xs font-semibold">{level.description}</p>
          </div>
          <div className="flex-shrink-0">
            <CharacterSprite character={level.character} mood="happy" size={44} />
          </div>
        </div>
      </div>

      {/* Hint */}
      {hint && (
        <div className="px-4 pt-3 max-w-lg mx-auto w-full">
          <div className="bg-white/15 rounded-2xl px-4 py-3 flex items-center gap-2">
            <span className="text-xl">💡</span>
            <p className="text-white font-bold text-base">{hint}</p>
          </div>
        </div>
      )}

      {/* Game content */}
      <div className="flex-1 px-4 py-3 max-w-lg mx-auto w-full">
        {children}
      </div>

      {/* Complete button */}
      {completed && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-8 pt-3 max-w-lg mx-auto w-full"
        >
          <BigButton
            color="#f59e0b"
            onClick={() => onComplete(stars)}
            className="w-full text-gray-900 font-black text-xl py-5"
          >
            完成！拿走 {stars} ⭐
          </BigButton>
        </motion.div>
      )}
    </div>
  )
}
