'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GAME_LEVELS } from '@/lib/gameData'
import GameShell from './GameShell'
import ConfettiEffect from '@/components/ui/ConfettiEffect'

const TEETH = ['🦷', '🦷', '🦷', '🦷', '🦷', '🦷']

export default function BrushTeethGame({ onComplete }: { onComplete: (stars: number) => void }) {
  const level = GAME_LEVELS.find((l) => l.id === 'brush-teeth')!
  const [brushed, setBrushed] = useState<boolean[]>(new Array(6).fill(false))
  const [brushPos, setBrushPos] = useState({ x: 0, y: 0 })
  const [showBrush, setShowBrush] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const brushCount = brushed.filter(Boolean).length
  const allDone = brushCount === 6
  const stars = allDone ? 3 : brushCount >= 4 ? 2 : 1

  const handleToothClick = (idx: number) => {
    if (brushed[idx]) return
    const updated = [...brushed]
    updated[idx] = true
    setBrushed(updated)
    if (updated.filter(Boolean).length === 6) setShowConfetti(true)
  }

  return (
    <GameShell
      level={level}
      onComplete={onComplete}
      completed={allDone}
      stars={stars}
      hint="點擊每顆牙齒，幫小熊刷乾淨！"
    >
      <ConfettiEffect show={showConfetti} />

      <div className="flex flex-col items-center gap-6 pt-4">
        {/* Bear Face */}
        <motion.div
          className="text-8xl"
          animate={allDone ? { rotate: [0, 10, -10, 0] } : {}}
          transition={{ repeat: allDone ? Infinity : 0, duration: 0.5 }}
        >
          🐻
        </motion.div>

        {/* Progress */}
        <div className="bg-white rounded-2xl px-6 py-3 shadow-md">
          <p className="font-black text-gray-600 text-center">
            已刷乾淨 {brushCount} / {TEETH.length} 顆
          </p>
          <div className="w-full bg-gray-100 rounded-full h-3 mt-2">
            <motion.div
              className="h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
              animate={{ width: `${(brushCount / TEETH.length) * 100}%` }}
              transition={{ type: 'spring' }}
            />
          </div>
        </div>

        {/* Teeth Grid */}
        <div className="grid grid-cols-3 gap-4">
          {TEETH.map((tooth, idx) => (
            <motion.button
              key={idx}
              onClick={() => handleToothClick(idx)}
              whileHover={{ scale: brushed[idx] ? 1 : 1.15 }}
              whileTap={{ scale: 0.9 }}
              animate={brushed[idx] ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
              className={`w-20 h-20 rounded-2xl text-5xl flex items-center justify-center shadow-md ${
                brushed[idx]
                  ? 'bg-gradient-to-br from-green-200 to-emerald-300'
                  : 'bg-white hover:bg-yellow-50'
              }`}
              style={{ boxShadow: brushed[idx] ? '0 4px 0 #86efac' : '0 4px 0 #e5e7eb' }}
            >
              {brushed[idx] ? '✨' : tooth}
            </motion.button>
          ))}
        </div>

        {/* Toothbrush */}
        <motion.div
          animate={{ rotate: [0, 15, -15, 0], x: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-6xl"
        >
          🪥
        </motion.div>

        {allDone && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
            className="bg-white rounded-2xl px-6 py-4 shadow-lg text-center"
          >
            <p className="text-3xl font-black text-green-600">超棒！牙齒好乾淨！✨</p>
            <p className="text-gray-500 mt-1">每天刷牙，保持健康！</p>
          </motion.div>
        )}
      </div>
    </GameShell>
  )
}
