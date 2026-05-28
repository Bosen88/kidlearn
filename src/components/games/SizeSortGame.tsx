'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { GAME_LEVELS } from '@/lib/gameData'
import GameShell from './GameShell'
import ConfettiEffect from '@/components/ui/ConfettiEffect'

const SETS = [
  { emoji: '🐘', sizes: [30, 55, 80], labels: ['小', '中', '大'] },
  { emoji: '⭐', sizes: [25, 50, 75], labels: ['小', '中', '大'] },
  { emoji: '🍎', sizes: [28, 52, 76], labels: ['小', '中', '大'] },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function SizeSortGame({ onComplete }: { onComplete: (stars: number) => void }) {
  const level = GAME_LEVELS.find((l) => l.id === 'size-sort')!
  const [setIdx, setSetIdx] = useState(0)
  const [order, setOrder] = useState<number[]>([])
  const [shuffled] = useState(() => SETS.map((s) => shuffle([0, 1, 2])))
  const [correct, setCorrect] = useState(0)
  const [done, setDone] = useState(false)
  const [wrong, setWrong] = useState(false)

  const current = SETS[setIdx]
  const currentShuffled = shuffled[setIdx]
  const stars = correct >= 3 ? 3 : correct >= 2 ? 2 : 1

  const handleClick = (sizeIdx: number) => {
    const nextOrder = [...order, sizeIdx]
    setOrder(nextOrder)

    if (nextOrder.length === 3) {
      const sorted = [...nextOrder].sort((a, b) => current.sizes[a] - current.sizes[b])
      const isCorrect = JSON.stringify(nextOrder) === JSON.stringify(sorted)
      if (isCorrect) {
        setCorrect((c) => c + 1)
        const next = setIdx + 1
        if (next >= SETS.length) setDone(true)
        else { setSetIdx(next); setOrder([]) }
      } else {
        setWrong(true)
        setTimeout(() => { setWrong(false); setOrder([]) }, 1000)
      }
    }
  }

  return (
    <GameShell level={level} onComplete={onComplete} completed={done} stars={stars}
      hint="從最小的開始，依序點選！">
      <ConfettiEffect show={done} />

      <div className="flex flex-col items-center gap-6 pt-4">
        {!done && (
          <>
            <div className="bg-white rounded-2xl px-6 py-3 shadow-md">
              <p className="font-black text-gray-700 text-center">從最小到最大排列 {current.emoji}</p>
              <p className="text-gray-400 text-sm text-center">已選：{order.length} / 3</p>
            </div>

            {wrong && (
              <motion.div animate={{ x: [-5, 5, -5, 0] }} className="bg-red-100 text-red-500 font-black rounded-2xl px-6 py-2">
                不對！再試一次！
              </motion.div>
            )}

            <div className="flex items-end justify-center gap-8">
              {currentShuffled.map((sizeIdx) => {
                const size = current.sizes[sizeIdx]
                const isSelected = order.includes(sizeIdx)
                return (
                  <motion.button
                    key={sizeIdx}
                    onClick={() => !isSelected && handleClick(sizeIdx)}
                    whileHover={isSelected ? {} : { scale: 1.1 }}
                    whileTap={isSelected ? {} : { scale: 0.9 }}
                    className="flex flex-col items-center gap-2"
                    disabled={isSelected}
                  >
                    <motion.span
                      style={{ fontSize: size, opacity: isSelected ? 0.3 : 1 }}
                      animate={isSelected ? { scale: 0.8 } : { scale: 1 }}
                    >
                      {current.emoji}
                    </motion.span>
                    {isSelected && (
                      <span className="text-green-500 font-black">✓{order.indexOf(sizeIdx) + 1}</span>
                    )}
                  </motion.button>
                )
              })}
            </div>

            <div className="flex gap-2">
              {SETS.map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${i < setIdx ? 'bg-green-400' : i === setIdx ? 'bg-yellow-400' : 'bg-white/40'}`} />
              ))}
            </div>
          </>
        )}

        {done && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
            className="bg-white rounded-[2rem] p-8 text-center shadow-xl">
            <div className="text-7xl">📏</div>
            <h2 className="text-3xl font-black text-purple-600 mt-3">排序達人！</h2>
            <p className="text-gray-500 mt-2">你知道大中小了！</p>
          </motion.div>
        )}
      </div>
    </GameShell>
  )
}
