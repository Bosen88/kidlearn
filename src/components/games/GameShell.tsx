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
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #eef2ff 0%, #fdf4ff 100%)' }}>

      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100 px-4 pt-4 pb-3 shadow-sm">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button
            onClick={() => router.push('/game')}
            className="flex-shrink-0 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-2xl px-4 py-2.5 text-sm transition-colors"
          >
            ← 返回
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-gray-800 font-black text-lg leading-tight truncate">{level.title}</p>
            <p className="text-gray-400 text-xs font-semibold">{level.description}</p>
          </div>
          <div className="flex-shrink-0">
            <CharacterSprite character={level.character} mood="happy" size={44} />
          </div>
        </div>
      </div>

      {/* Hint */}
      {hint && (
        <div className="px-4 pt-3 max-w-lg mx-auto w-full">
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3 flex items-center gap-2">
            <span className="text-xl flex-shrink-0">💡</span>
            <p className="text-indigo-700 font-bold text-base">{hint}</p>
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
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-8 pt-3 max-w-lg mx-auto w-full"
        >
          <BigButton color="#4f46e5" onClick={() => onComplete(stars)}
            className="w-full font-black text-xl py-5">
            完成！拿走 {stars} ⭐
          </BigButton>
        </motion.div>
      )}
    </div>
  )
}
