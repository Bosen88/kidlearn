'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GAME_LEVELS } from '@/lib/gameData'
import GameShell from './GameShell'
import ConfettiEffect from '@/components/ui/ConfettiEffect'

const ROUNDS = [
  {
    target: { color: '#ef4444', emoji: '🍎' },
    options: [
      { color: '#ef4444', emoji: '🎈' },
      { color: '#3b82f6', emoji: '💙' },
      { color: '#fbbf24', emoji: '🌻' },
      { color: '#22c55e', emoji: '🍀' },
    ],
  },
  {
    target: { color: '#fbbf24', emoji: '⭐' },
    options: [
      { color: '#ef4444', emoji: '❤️' },
      { color: '#fbbf24', emoji: '🌟' },
      { color: '#a855f7', emoji: '💜' },
      { color: '#22c55e', emoji: '🟢' },
    ],
  },
  {
    target: { color: '#3b82f6', emoji: '🫐' },
    options: [
      { color: '#3b82f6', emoji: '💧' },
      { color: '#ef4444', emoji: '🍓' },
      { color: '#fbbf24', emoji: '🍋' },
      { color: '#22c55e', emoji: '🥝' },
    ],
  },
  {
    target: { color: '#a855f7', emoji: '🍇' },
    options: [
      { color: '#fbbf24', emoji: '🌙' },
      { color: '#ef4444', emoji: '🌹' },
      { color: '#a855f7', emoji: '🦄' },
      { color: '#22c55e', emoji: '🐢' },
    ],
  },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function ColorMatchGame({ onComplete }: { onComplete: (stars: number) => void }) {
  const level = GAME_LEVELS.find((l) => l.id === 'color-match')!
  const [currentIdx, setCurrentIdx] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(false)
  const [done, setDone] = useState(false)
  const [shuffledOptions] = useState(() => ROUNDS.map((r) => shuffle(r.options)))

  const current = ROUNDS[currentIdx]
  const stars = correct >= 4 ? 3 : correct >= 3 ? 2 : 1

  const handleAnswer = (color: string) => {
    if (color === current.target.color) {
      const next = currentIdx + 1
      setCorrect((c) => c + 1)
      if (next >= ROUNDS.length) setDone(true)
      else setCurrentIdx(next)
    } else {
      setWrong(true)
      setTimeout(() => setWrong(false), 800)
    }
  }

  return (
    <GameShell level={level} onComplete={onComplete} completed={done} stars={stars} hint="找出和左邊一樣顏色的物品！">
      <ConfettiEffect show={done} />

      <div className="flex flex-col items-center gap-5 pt-2">
        {!done && (
          <>
            {/* Target */}
            <motion.div
              key={currentIdx}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="bg-white rounded-[2rem] p-6 text-center shadow-xl"
            >
              <div className="text-8xl">{current.target.emoji}</div>
              <div className="w-12 h-4 rounded-full mx-auto mt-2" style={{ backgroundColor: current.target.color }} />
              <p className="text-gray-500 text-sm mt-2 font-bold">找出這個顏色！</p>
            </motion.div>

            <AnimatePresence>
              {wrong && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="bg-red-100 text-red-500 font-black rounded-2xl px-6 py-2">
                  顏色不一樣！
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-3 w-full">
              {shuffledOptions[currentIdx].map((opt, i) => (
                <motion.button
                  key={i}
                  onClick={() => handleAnswer(opt.color)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="bg-white rounded-2xl py-6 text-center shadow-md"
                  style={{ borderBottom: `5px solid ${opt.color}` }}
                >
                  <div className="text-5xl">{opt.emoji}</div>
                </motion.button>
              ))}
            </div>

            <p className="text-white/70 font-bold">{currentIdx + 1} / {ROUNDS.length}</p>
          </>
        )}

        {done && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
            className="bg-white rounded-[2rem] p-8 text-center shadow-xl">
            <div className="text-7xl">🎨</div>
            <h2 className="text-3xl font-black text-purple-600 mt-3">顏色小天才！</h2>
            <p className="text-gray-500 mt-2">答對 {correct} / {ROUNDS.length} 題</p>
          </motion.div>
        )}
      </div>
    </GameShell>
  )
}
