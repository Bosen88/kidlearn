'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GAME_LEVELS } from '@/lib/gameData'
import GameShell from './GameShell'
import ConfettiEffect from '@/components/ui/ConfettiEffect'

const STEPS = [
  { icon: '🚰', label: '打開水龍頭', desc: '先把水打開' },
  { icon: '🤲', label: '手放水下', desc: '把手弄濕' },
  { icon: '🧴', label: '擦上肥皂', desc: '擠一點肥皂' },
  { icon: '👐', label: '搓揉雙手', desc: '搓搓搓20秒！' },
  { icon: '💧', label: '沖洗乾淨', desc: '把泡泡沖掉' },
  { icon: '🧻', label: '擦乾雙手', desc: '用毛巾擦乾！' },
]

export default function WashHandsGame({ onComplete }: { onComplete: (stars: number) => void }) {
  const level = GAME_LEVELS.find((l) => l.id === 'wash-hands')!
  const [currentStep, setCurrentStep] = useState(0)
  const [done, setDone] = useState(false)
  const [wrong, setWrong] = useState(false)
  const [shuffled] = useState(() => {
    const arr = [...STEPS]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  })

  const handleStep = (step: typeof STEPS[0]) => {
    if (done) return
    if (step.label === STEPS[currentStep].label) {
      const next = currentStep + 1
      setCurrentStep(next)
      setWrong(false)
      if (next === STEPS.length) setDone(true)
    } else {
      setWrong(true)
      setTimeout(() => setWrong(false), 1000)
    }
  }

  return (
    <GameShell
      level={level}
      onComplete={onComplete}
      completed={done}
      stars={3}
      hint={`第 ${Math.min(currentStep + 1, STEPS.length)} 步：${STEPS[currentStep]?.label ?? '完成！'}`}
    >
      <ConfettiEffect show={done} />

      <div className="flex flex-col items-center gap-4 pt-2">
        {/* Progress Steps */}
        <div className="flex gap-2 bg-white rounded-2xl px-4 py-3 shadow-md w-full">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-colors ${
                i < currentStep ? 'bg-green-400' : i === currentStep ? 'bg-yellow-400' : 'bg-gray-100'
              }`}
            />
          ))}
        </div>

        <AnimatePresence>
          {wrong && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="bg-red-100 text-red-500 font-black rounded-2xl px-6 py-2 text-lg"
            >
              不對！再想想！🤔
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {shuffled.map((step, idx) => {
            const isPast = currentStep > STEPS.indexOf(STEPS.find(s => s.label === step.label)!)
            return (
              <motion.button
                key={idx}
                onClick={() => handleStep(step)}
                whileHover={isPast ? {} : { scale: 1.04 }}
                whileTap={isPast ? {} : { scale: 0.96 }}
                className={`rounded-2xl p-4 flex flex-col items-center gap-2 shadow-md ${
                  isPast ? 'bg-green-100 opacity-60' : 'bg-white'
                }`}
                style={{ boxShadow: '0 4px 0 #e5e7eb' }}
                disabled={isPast}
              >
                <span className="text-4xl">{step.icon}</span>
                <span className="font-black text-gray-700 text-sm text-center">{step.label}</span>
                <span className="text-gray-400 text-xs text-center">{step.desc}</span>
                {isPast && <span className="text-green-500 font-black">✓</span>}
              </motion.button>
            )
          })}
        </div>

        {done && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
            className="bg-white rounded-2xl px-6 py-4 shadow-lg text-center">
            <p className="text-3xl font-black text-green-600">太棒了！手洗好乾淨！🙌</p>
            <p className="text-gray-500 mt-1">細菌都跑掉了！</p>
          </motion.div>
        )}
      </div>
    </GameShell>
  )
}
