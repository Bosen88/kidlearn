'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { GAME_LEVELS } from '@/lib/gameData'
import GameShell from './GameShell'
import ConfettiEffect from '@/components/ui/ConfettiEffect'

const BINS = [
  { id: 'toys', label: '玩具箱', icon: '📦', color: '#ffd93d' },
  { id: 'books', label: '書架', icon: '📚', color: '#4d96ff' },
  { id: 'clothes', label: '衣櫃', icon: '🗄️', color: '#a855f7' },
]

const ITEMS = [
  { id: '1', emoji: '🧸', label: '玩偶', bin: 'toys' },
  { id: '2', emoji: '🚗', label: '玩具車', bin: 'toys' },
  { id: '3', emoji: '📖', label: '故事書', bin: 'books' },
  { id: '4', emoji: '✏️', label: '蠟筆書', bin: 'books' },
  { id: '5', emoji: '👕', label: 'T恤', bin: 'clothes' },
  { id: '6', emoji: '🧦', label: '襪子', bin: 'clothes' },
]

export default function TidyToysGame({ onComplete }: { onComplete: (stars: number) => void }) {
  const level = GAME_LEVELS.find((l) => l.id === 'tidy-toys')!
  const [remaining, setRemaining] = useState(ITEMS)
  const [sorted, setSorted] = useState<Record<string, string[]>>({ toys: [], books: [], clothes: [] })
  const [wrong, setWrong] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)

  const done = remaining.length === 0
  const correctCount = Object.values(sorted).flat().length
  const stars = done ? 3 : correctCount >= 4 ? 2 : 1

  const handleItemClick = (id: string) => {
    setSelected(selected === id ? null : id)
  }

  const handleBinClick = (binId: string) => {
    if (!selected) return
    const item = remaining.find((i) => i.id === selected)
    if (!item) return

    if (item.bin === binId) {
      setSorted((prev) => ({ ...prev, [binId]: [...prev[binId], item.emoji] }))
      setRemaining((prev) => prev.filter((i) => i.id !== selected))
      setSelected(null)
    } else {
      setWrong(selected)
      setTimeout(() => { setWrong(null); setSelected(null) }, 800)
    }
  }

  return (
    <GameShell level={level} onComplete={onComplete} completed={done} stars={stars}
      hint={selected ? '選好了！點選正確的收納位置！' : '先點選物品，再放到正確的地方！'}>
      <ConfettiEffect show={done} />

      <div className="flex flex-col gap-4 pt-2">
        {/* Bins */}
        <div className="grid grid-cols-3 gap-2">
          {BINS.map((bin) => (
            <motion.button
              key={bin.id}
              onClick={() => handleBinClick(bin.id)}
              whileHover={{ scale: selected ? 1.08 : 1 }}
              whileTap={{ scale: selected ? 0.95 : 1 }}
              className="rounded-2xl p-3 text-center shadow-md"
              style={{
                backgroundColor: selected ? bin.color + '33' : '#fff',
                border: selected ? `3px solid ${bin.color}` : '3px solid transparent',
              }}
            >
              <div className="text-3xl">{bin.icon}</div>
              <p className="font-black text-gray-700 text-xs mt-1">{bin.label}</p>
              <div className="flex flex-wrap gap-0.5 justify-center mt-1 min-h-[20px]">
                {sorted[bin.id].map((e, i) => (
                  <span key={i} className="text-sm">{e}</span>
                ))}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Items to sort */}
        <div className="bg-white rounded-[1.5rem] p-4 shadow-md">
          <p className="text-gray-500 font-bold text-sm mb-3 text-center">待整理的物品</p>
          <div className="grid grid-cols-3 gap-2">
            {remaining.map((item) => {
              const isSelected = selected === item.id
              const isWrong = wrong === item.id
              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  animate={isWrong ? { x: [-4, 4, -4, 4, 0] } : {}}
                  className={`rounded-2xl py-4 text-center shadow-sm ${
                    isSelected ? 'bg-yellow-100 ring-2 ring-yellow-400' :
                    isWrong ? 'bg-red-100' : 'bg-gray-50'
                  }`}
                >
                  <div className="text-4xl">{item.emoji}</div>
                  <p className="text-xs font-bold text-gray-500 mt-1">{item.label}</p>
                </motion.button>
              )
            })}
            {remaining.length === 0 && (
              <div className="col-span-3 text-center text-gray-400 font-bold py-4">全部整理好了！🎉</div>
            )}
          </div>
        </div>

        {done && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
            className="bg-white rounded-2xl p-5 text-center shadow-lg">
            <p className="text-3xl font-black text-green-600">整理達人！🏆</p>
            <p className="text-gray-500">你把所有東西都放好了！</p>
          </motion.div>
        )}
      </div>
    </GameShell>
  )
}
