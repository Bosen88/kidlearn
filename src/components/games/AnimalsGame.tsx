'use client'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GAME_LEVELS } from '@/lib/gameData'
import GameShell from './GameShell'
import ConfettiEffect from '@/components/ui/ConfettiEffect'

const PAIRS = [
  { emoji: '🐶', name: 'Dog' },
  { emoji: '🐱', name: 'Cat' },
  { emoji: '🐸', name: 'Frog' },
  { emoji: '🐧', name: 'Penguin' },
  { emoji: '🦁', name: 'Lion' },
  { emoji: '🐘', name: 'Elephant' },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function AnimalsGame({ onComplete }: { onComplete: (stars: number) => void }) {
  const level = GAME_LEVELS.find((l) => l.id === 'animals')!
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [wrong, setWrong] = useState(false)
  const [shuffledEmojis] = useState(() => shuffle(PAIRS))
  const [shuffledNames] = useState(() => shuffle(PAIRS))

  const done = matched.size === PAIRS.length
  const stars = done ? 3 : matched.size >= 4 ? 2 : 1

  const handleEmoji = (emoji: string) => {
    if (matched.has(emoji)) return
    setSelectedEmoji(emoji)
    if (selectedName) checkMatch(emoji, selectedName)
  }

  const handleName = (name: string) => {
    const pair = PAIRS.find((p) => p.name === name)
    if (!pair || matched.has(pair.emoji)) return
    setSelectedName(name)
    if (selectedEmoji) checkMatch(selectedEmoji, name)
  }

  const checkMatch = (emoji: string, name: string) => {
    const pair = PAIRS.find((p) => p.emoji === emoji)
    if (pair?.name === name) {
      setMatched((prev) => new Set([...prev, emoji]))
      setSelectedEmoji(null)
      setSelectedName(null)
    } else {
      setWrong(true)
      setTimeout(() => {
        setSelectedEmoji(null)
        setSelectedName(null)
        setWrong(false)
      }, 800)
    }
  }

  return (
    <GameShell level={level} onComplete={onComplete} completed={done} stars={stars} hint="配對動物和牠的英文名字！">
      <ConfettiEffect show={done} />

      <div className="flex flex-col gap-3 pt-2">
        <AnimatePresence>
          {wrong && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="bg-red-100 text-red-500 font-black text-center rounded-2xl py-2">
              再試一次！🤔
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-4">
          {/* Emoji Column */}
          <div className="flex flex-col gap-2">
            <p className="text-white font-black text-center text-sm">動物</p>
            {shuffledEmojis.map((p) => {
              const isMatched = matched.has(p.emoji)
              const isSelected = selectedEmoji === p.emoji
              return (
                <motion.button
                  key={p.emoji}
                  onClick={() => handleEmoji(p.emoji)}
                  whileHover={isMatched ? {} : { scale: 1.05 }}
                  whileTap={isMatched ? {} : { scale: 0.95 }}
                  className={`rounded-2xl py-3 text-4xl shadow-md transition-colors ${
                    isMatched ? 'bg-green-100 opacity-50' :
                    isSelected ? 'bg-yellow-200' : 'bg-white'
                  }`}
                  disabled={isMatched}
                >
                  {p.emoji}
                  {isMatched && <span className="text-lg ml-1">✓</span>}
                </motion.button>
              )
            })}
          </div>

          {/* Name Column */}
          <div className="flex flex-col gap-2">
            <p className="text-white font-black text-center text-sm">英文</p>
            {shuffledNames.map((p) => {
              const isMatched = matched.has(p.emoji)
              const isSelected = selectedName === p.name
              return (
                <motion.button
                  key={p.name}
                  onClick={() => handleName(p.name)}
                  whileHover={isMatched ? {} : { scale: 1.05 }}
                  whileTap={isMatched ? {} : { scale: 0.95 }}
                  className={`rounded-2xl py-3 px-3 font-black text-lg shadow-md transition-colors ${
                    isMatched ? 'bg-green-100 opacity-50 text-gray-400' :
                    isSelected ? 'bg-yellow-200 text-gray-700' : 'bg-white text-gray-700'
                  }`}
                  disabled={isMatched}
                >
                  {p.name}
                </motion.button>
              )
            })}
          </div>
        </div>

        <div className="bg-white/30 backdrop-blur rounded-2xl px-4 py-2 text-center">
          <p className="text-white font-bold">配對成功 {matched.size} / {PAIRS.length} 對</p>
        </div>
      </div>
    </GameShell>
  )
}
