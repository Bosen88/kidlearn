'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GAME_LEVELS } from '@/lib/gameData'
import GameShell from './GameShell'
import ConfettiEffect from '@/components/ui/ConfettiEffect'

const COLORS_DATA = [
  { name: 'Red', zh: '紅色', hex: '#ef4444', emoji: '🍎' },
  { name: 'Blue', zh: '藍色', hex: '#3b82f6', emoji: '🫐' },
  { name: 'Yellow', zh: '黃色', hex: '#fbbf24', emoji: '🌻' },
  { name: 'Green', zh: '綠色', hex: '#22c55e', emoji: '🍀' },
  { name: 'Purple', zh: '紫色', hex: '#a855f7', emoji: '🍇' },
  { name: 'Orange', zh: '橘色', hex: '#f97316', emoji: '🍊' },
  { name: 'Pink', zh: '粉色', hex: '#ec4899', emoji: '🌸' },
  { name: 'White', zh: '白色', hex: '#e5e7eb', emoji: '☁️' },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function ColorsGame({ onComplete }: { onComplete: (stars: number) => void }) {
  const level = GAME_LEVELS.find((l) => l.id === 'colors')!
  const [queue] = useState(() => shuffle(COLORS_DATA))
  const [currentIdx, setCurrentIdx] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(false)
  const [done, setDone] = useState(false)
  const [options] = useState(() => {
    return queue.map((target) => {
      const others = shuffle(COLORS_DATA.filter((c) => c.name !== target.name)).slice(0, 3)
      return shuffle([target, ...others])
    })
  })

  const current = queue[currentIdx]
  const currentOptions = options[currentIdx]
  const stars = correct >= 7 ? 3 : correct >= 5 ? 2 : 1

  const handleAnswer = (name: string) => {
    if (name === current.name) {
      const next = currentIdx + 1
      setCorrect((c) => c + 1)
      if (next >= queue.length) {
        setDone(true)
      } else {
        setCurrentIdx(next)
      }
    } else {
      setWrong(true)
      setTimeout(() => setWrong(false), 800)
    }
  }

  return (
    <GameShell level={level} onComplete={onComplete} completed={done} stars={stars} hint="選出正確的顏色名稱！">
      <ConfettiEffect show={done} />

      <div className="flex flex-col items-center gap-5 pt-2">
        {!done && (
          <>
            {/* Color Display */}
            <motion.div
              key={currentIdx}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring' }}
              className="w-40 h-40 rounded-[2rem] shadow-xl flex flex-col items-center justify-center gap-2"
              style={{ backgroundColor: current.hex, boxShadow: `0 8px 0 ${darken(current.hex)}` }}
            >
              <span className="text-6xl">{current.emoji}</span>
            </motion.div>

            <p className="text-white font-black text-2xl">這是什麼顏色？</p>

            <AnimatePresence>
              {wrong && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="bg-red-100 text-red-500 font-black rounded-2xl px-6 py-2">
                  再試一次！
                </motion.div>
              )}
            </AnimatePresence>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3 w-full">
              {currentOptions.map((opt) => (
                <motion.button
                  key={opt.name}
                  onClick={() => handleAnswer(opt.name)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white rounded-2xl py-4 px-4 shadow-md"
                  style={{ boxShadow: '0 4px 0 #e5e7eb' }}
                >
                  <div className="w-8 h-8 rounded-full mx-auto mb-2" style={{ backgroundColor: opt.hex }} />
                  <p className="font-black text-gray-700">{opt.name}</p>
                  <p className="text-gray-400 text-sm">{opt.zh}</p>
                </motion.button>
              ))}
            </div>

            <p className="text-white/70 font-bold">{currentIdx + 1} / {queue.length}</p>
          </>
        )}

        {done && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
            className="bg-white rounded-[2rem] p-8 text-center shadow-xl">
            <div className="text-7xl">🌈</div>
            <h2 className="text-3xl font-black text-purple-600 mt-3">顏色學得很棒！</h2>
            <p className="text-gray-500 mt-2">答對 {correct} / {queue.length} 題</p>
          </motion.div>
        )}
      </div>
    </GameShell>
  )
}

function darken(hex: string): string {
  const n = parseInt(hex.replace('#',''), 16)
  const r = Math.max(0, ((n >> 16) & 0xff) - 40)
  const g = Math.max(0, ((n >> 8) & 0xff) - 40)
  const b = Math.max(0, (n & 0xff) - 40)
  return `rgb(${r},${g},${b})`
}
