'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { GAME_LEVELS } from '@/lib/gameData'
import GameShell from './GameShell'

const LETTERS = [
  { letter: 'A', emoji: '🍎', word: 'Apple' },
  { letter: 'B', emoji: '🐝', word: 'Bee' },
  { letter: 'C', emoji: '🐱', word: 'Cat' },
  { letter: 'D', emoji: '🐶', word: 'Dog' },
  { letter: 'E', emoji: '🐘', word: 'Elephant' },
  { letter: 'F', emoji: '🐟', word: 'Fish' },
  { letter: 'G', emoji: '🦒', word: 'Giraffe' },
  { letter: 'H', emoji: '🏠', word: 'House' },
  { letter: 'I', emoji: '🍦', word: 'Ice cream' },
  { letter: 'J', emoji: '🪼', word: 'Jellyfish' },
  { letter: 'K', emoji: '🦘', word: 'Kangaroo' },
  { letter: 'L', emoji: '🦁', word: 'Lion' },
]

const COLORS = ['#ff6b9d', '#ffd93d', '#6bcb77', '#4d96ff', '#c77dff', '#ff9f43', '#a8e6cf', '#ffd3b6']

export default function AlphabetGame({ onComplete }: { onComplete: (stars: number) => void }) {
  const level = GAME_LEVELS.find((l) => l.id === 'alphabet')!
  const [selected, setSelected] = useState<string | null>(null)
  const [touched, setTouched] = useState<Set<string>>(new Set())

  const handleSelect = (letter: string) => {
    setSelected(letter)
    setTouched((prev) => new Set([...prev, letter]))
  }

  const done = touched.size >= 8
  const stars = touched.size >= 12 ? 3 : touched.size >= 8 ? 2 : 1

  const current = LETTERS.find((l) => l.letter === selected)

  return (
    <GameShell
      level={level}
      onComplete={onComplete}
      completed={done}
      stars={stars}
      hint="點擊字母聽發音！認識8個就過關！"
    >
      <div className="flex flex-col items-center gap-4 pt-2">
        {/* Selected Letter Display */}
        {current ? (
          <motion.div
            key={selected}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="bg-white rounded-[2rem] p-6 w-full text-center shadow-xl"
          >
            <div className="flex items-center justify-center gap-4">
              <span className="text-7xl font-black" style={{ color: COLORS[LETTERS.findIndex(l => l.letter === selected) % COLORS.length] }}>
                {current.letter}
              </span>
              <span className="text-7xl">{current.emoji}</span>
            </div>
            <p className="text-3xl font-black text-gray-700 mt-2">{current.word}</p>
            <p className="text-gray-400 text-lg">「{current.letter.toLowerCase()}」</p>
          </motion.div>
        ) : (
          <div className="bg-white/30 backdrop-blur rounded-[2rem] p-6 w-full text-center">
            <p className="text-white font-black text-xl">點擊下面的字母吧！</p>
          </div>
        )}

        {/* Progress */}
        <div className="bg-white rounded-2xl px-4 py-2 shadow-md w-full">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-500 text-sm font-bold">已認識</span>
            <span className="text-gray-700 font-black">{touched.size} / {LETTERS.length}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400"
              animate={{ width: `${(touched.size / LETTERS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Letters Grid */}
        <div className="grid grid-cols-4 gap-2 w-full">
          {LETTERS.map((item, idx) => {
            const isTouched = touched.has(item.letter)
            const color = COLORS[idx % COLORS.length]
            return (
              <motion.button
                key={item.letter}
                onClick={() => handleSelect(item.letter)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="rounded-2xl py-3 flex flex-col items-center gap-1 shadow-md"
                style={{
                  backgroundColor: isTouched ? color : '#f9f9f9',
                  boxShadow: `0 4px 0 ${isTouched ? darken(color) : '#e5e7eb'}`,
                }}
              >
                <span className="text-2xl font-black" style={{ color: isTouched ? 'white' : color }}>
                  {item.letter}
                </span>
                <span className="text-xl">{item.emoji}</span>
                {isTouched && <span className="text-white text-xs font-bold">✓</span>}
              </motion.button>
            )
          })}
        </div>
      </div>
    </GameShell>
  )
}

function darken(hex: string): string {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, ((n >> 16) & 0xff) - 40)
  const g = Math.max(0, ((n >> 8) & 0xff) - 40)
  const b = Math.max(0, (n & 0xff) - 40)
  return `rgb(${r},${g},${b})`
}
