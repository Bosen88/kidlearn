'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GAME_LEVELS } from '@/lib/gameData'
import GameShell from './GameShell'
import ConfettiEffect from '@/components/ui/ConfettiEffect'

const EMOTIONS = [
  { name: '開心', en: 'Happy', emoji: '😄', color: '#ffd93d', desc: '心情很好的感覺' },
  { name: '傷心', en: 'Sad', emoji: '😢', color: '#4d96ff', desc: '想哭的感覺' },
  { name: '生氣', en: 'Angry', emoji: '😠', color: '#ef4444', desc: '不高興的感覺' },
  { name: '驚訝', en: 'Surprised', emoji: '😮', color: '#a855f7', desc: '嚇一跳的感覺' },
  { name: '害怕', en: 'Scared', emoji: '😨', color: '#6bcb77', desc: '有點緊張的感覺' },
  { name: '愛心', en: 'Love', emoji: '🥰', color: '#ff6b9d', desc: '喜歡某人的感覺' },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function EmotionsGame({ onComplete }: { onComplete: (stars: number) => void }) {
  const level = GAME_LEVELS.find((l) => l.id === 'emotions')!
  const [queue] = useState(() => shuffle(EMOTIONS))
  const [currentIdx, setCurrentIdx] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(false)
  const [done, setDone] = useState(false)
  const [options] = useState(() =>
    queue.map((target) => shuffle([target, ...shuffle(EMOTIONS.filter((e) => e.name !== target.name)).slice(0, 3)]))
  )

  const current = queue[currentIdx]
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
    <GameShell level={level} onComplete={onComplete} completed={done} stars={stars} hint="這個表情是什麼感覺？">
      <ConfettiEffect show={done} />

      <div className="flex flex-col items-center gap-5 pt-2">
        {!done && (
          <>
            <motion.div
              key={currentIdx}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring' }}
              className="bg-white rounded-[2rem] p-8 shadow-xl text-center"
              style={{ borderBottom: `6px solid ${current.color}` }}
            >
              <div className="text-9xl">{current.emoji}</div>
              <p className="text-gray-400 mt-2 text-sm">{current.desc}</p>
            </motion.div>

            <AnimatePresence>
              {wrong && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="bg-red-100 text-red-500 font-black rounded-2xl px-6 py-2">
                  再想想！
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-3 w-full">
              {options[currentIdx].map((opt) => (
                <motion.button
                  key={opt.name}
                  onClick={() => handleAnswer(opt.name)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  className="bg-white rounded-2xl py-4 px-4 shadow-md"
                >
                  <span className="text-3xl">{opt.emoji}</span>
                  <p className="font-black text-gray-700 mt-1">{opt.name}</p>
                  <p className="text-gray-400 text-sm">{opt.en}</p>
                </motion.button>
              ))}
            </div>
          </>
        )}

        {done && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
            className="bg-white rounded-[2rem] p-8 text-center shadow-xl">
            <div className="text-7xl">😊</div>
            <h2 className="text-3xl font-black text-purple-600 mt-3">情緒小達人！</h2>
            <p className="text-gray-500 mt-2">答對 {correct} / {queue.length} 題</p>
          </motion.div>
        )}
      </div>
    </GameShell>
  )
}
