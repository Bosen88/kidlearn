'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GAME_LEVELS } from '@/lib/gameData'
import GameShell from './GameShell'
import ConfettiEffect from '@/components/ui/ConfettiEffect'

const SHAPES = [
  { name: '圓形', en: 'Circle', svg: <circle cx="30" cy="30" r="28" /> },
  { name: '正方形', en: 'Square', svg: <rect x="4" y="4" width="52" height="52" rx="4" /> },
  { name: '三角形', en: 'Triangle', svg: <polygon points="30,4 58,56 2,56" /> },
  { name: '星形', en: 'Star', svg: <polygon points="30,2 37,22 58,22 42,34 48,56 30,44 12,56 18,34 2,22 23,22" /> },
  { name: '菱形', en: 'Diamond', svg: <polygon points="30,2 58,30 30,58 2,30" /> },
  { name: '心形', en: 'Heart', svg: <path d="M30 50 C10 30 2 20 10 10 C18 0 30 10 30 10 C30 10 42 0 50 10 C58 20 50 30 30 50Z" /> },
]

const COLORS = ['#ff6b9d', '#4d96ff', '#ffd93d', '#6bcb77', '#c77dff', '#ff9f43']

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function ShapesGame({ onComplete }: { onComplete: (stars: number) => void }) {
  const level = GAME_LEVELS.find((l) => l.id === 'shapes')!
  const [queue] = useState(() => shuffle(SHAPES))
  const [currentIdx, setCurrentIdx] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(false)
  const [done, setDone] = useState(false)
  const [options] = useState(() =>
    queue.map((target) => shuffle([target, ...shuffle(SHAPES.filter((s) => s.name !== target.name)).slice(0, 3)]))
  )

  const current = queue[currentIdx]
  const currentColor = COLORS[currentIdx % COLORS.length]
  const stars = correct >= 5 ? 3 : correct >= 3 ? 2 : 1

  const handleAnswer = (name: string) => {
    if (name === current.name) {
      const next = currentIdx + 1
      setCorrect((c) => c + 1)
      if (next >= queue.length) setDone(true)
      else setCurrentIdx(next)
    } else {
      setWrong(true)
      setTimeout(() => setWrong(false), 800)
    }
  }

  return (
    <GameShell level={level} onComplete={onComplete} completed={done} stars={stars} hint="這是什麼形狀？">
      <ConfettiEffect show={done} />

      <div className="flex flex-col items-center gap-5 pt-2">
        {!done && (
          <>
            <motion.div
              key={currentIdx}
              initial={{ scale: 0.5, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 250 }}
              className="bg-white rounded-[2rem] p-8 shadow-xl"
            >
              <svg width="120" height="120" viewBox="0 0 60 60" fill={currentColor}>
                {current.svg}
              </svg>
            </motion.div>

            <p className="text-white font-black text-2xl">這是什麼形狀？</p>

            <AnimatePresence>
              {wrong && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="bg-red-100 text-red-500 font-black rounded-2xl px-6 py-2">
                  不對，再想想！
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-3 w-full">
              {options[currentIdx].map((opt, i) => (
                <motion.button
                  key={opt.name}
                  onClick={() => handleAnswer(opt.name)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white rounded-2xl py-4 px-4 shadow-md flex items-center gap-3"
                >
                  <svg width="32" height="32" viewBox="0 0 60 60" fill={COLORS[i % COLORS.length]}>
                    {opt.svg}
                  </svg>
                  <div className="text-left">
                    <p className="font-black text-gray-700">{opt.name}</p>
                    <p className="text-gray-400 text-sm">{opt.en}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </>
        )}

        {done && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
            className="bg-white rounded-[2rem] p-8 text-center shadow-xl">
            <div className="text-7xl">🔷</div>
            <h2 className="text-3xl font-black text-purple-600 mt-3">形狀大師！</h2>
            <p className="text-gray-500 mt-2">答對 {correct} / {queue.length} 題</p>
          </motion.div>
        )}
      </div>
    </GameShell>
  )
}
