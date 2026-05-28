'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GAME_LEVELS } from '@/lib/gameData'
import GameShell from './GameShell'
import ConfettiEffect from '@/components/ui/ConfettiEffect'

const NUMBERS = [
  { num: 1, en: 'One', emoji: '⭐' },
  { num: 2, en: 'Two', emoji: '🍎' },
  { num: 3, en: 'Three', emoji: '🐶' },
  { num: 4, en: 'Four', emoji: '🌈' },
  { num: 5, en: 'Five', emoji: '🌟' },
  { num: 6, en: 'Six', emoji: '🎈' },
  { num: 7, en: 'Seven', emoji: '🦋' },
  { num: 8, en: 'Eight', emoji: '🐠' },
  { num: 9, en: 'Nine', emoji: '🌸' },
  { num: 10, en: 'Ten', emoji: '🎉' },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function NumbersGame({ onComplete }: { onComplete: (stars: number) => void }) {
  const level = GAME_LEVELS.find((l) => l.id === 'numbers')!
  const [queue] = useState(() => shuffle(NUMBERS))
  const [currentIdx, setCurrentIdx] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(false)
  const [done, setDone] = useState(false)
  const [options] = useState(() =>
    queue.map((target) => shuffle([target, ...shuffle(NUMBERS.filter((n) => n.num !== target.num)).slice(0, 3)]))
  )

  const current = queue[currentIdx]
  const stars = correct >= 8 ? 3 : correct >= 5 ? 2 : 1

  const handleAnswer = (num: number) => {
    if (num === current.num) {
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
    <GameShell level={level} onComplete={onComplete} completed={done} stars={stars} hint="數一數，幾個圖案？">
      <ConfettiEffect show={done} />

      <div className="flex flex-col items-center gap-4 pt-2">
        {!done && (
          <>
            {/* Emoji Count Display */}
            <motion.div
              key={currentIdx}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[2rem] p-6 w-full shadow-xl"
            >
              <div className="flex flex-wrap justify-center gap-2 min-h-[80px] items-center">
                {Array.from({ length: current.num }).map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-4xl"
                  >
                    {current.emoji}
                  </motion.span>
                ))}
              </div>
              <p className="text-center text-gray-400 text-sm mt-3 font-bold">數一數有幾個？</p>
            </motion.div>

            <AnimatePresence>
              {wrong && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="bg-red-100 text-red-500 font-black rounded-2xl px-6 py-2">
                  再數一次！
                </motion.div>
              )}
            </AnimatePresence>

            {/* Number Choices */}
            <div className="grid grid-cols-2 gap-3 w-full">
              {options[currentIdx].map((opt) => (
                <motion.button
                  key={opt.num}
                  onClick={() => handleAnswer(opt.num)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  className="bg-white rounded-2xl py-5 shadow-md"
                  style={{ boxShadow: '0 5px 0 #e5e7eb' }}
                >
                  <p className="text-5xl font-black text-purple-600">{opt.num}</p>
                  <p className="text-gray-500 font-bold">{opt.en}</p>
                </motion.button>
              ))}
            </div>

            <p className="text-white/70 font-bold">{currentIdx + 1} / {queue.length}</p>
          </>
        )}

        {done && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
            className="bg-white rounded-[2rem] p-8 text-center shadow-xl">
            <div className="text-7xl">🔢</div>
            <h2 className="text-3xl font-black text-purple-600 mt-3">數字天才！</h2>
            <p className="text-gray-500 mt-2">答對 {correct} / {queue.length} 題</p>
          </motion.div>
        )}
      </div>
    </GameShell>
  )
}
