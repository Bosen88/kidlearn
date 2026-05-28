'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GAME_LEVELS } from '@/lib/gameData'
import GameShell from './GameShell'
import ConfettiEffect from '@/components/ui/ConfettiEffect'

const WEATHER_SCENARIOS = [
  {
    weather: '☀️ 晴天',
    items: ['👕 T恤', '👖 短褲', '👟 球鞋'],
    wrong: ['🧥 厚外套', '🧤 手套'],
  },
  {
    weather: '🌧️ 下雨天',
    items: ['☂️ 雨傘', '🌂 雨衣', '🥾 雨靴'],
    wrong: ['🩴 涼鞋', '🕶️ 太陽眼鏡'],
  },
  {
    weather: '❄️ 冬天',
    items: ['🧥 厚外套', '🧤 手套', '🧣 圍巾'],
    wrong: ['🩴 涼鞋', '👙 泳衣'],
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

export default function GetDressedGame({ onComplete }: { onComplete: (stars: number) => void }) {
  const level = GAME_LEVELS.find((l) => l.id === 'get-dressed')!
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [wrong, setWrong] = useState<string | null>(null)
  const [correct, setCorrect] = useState(0)
  const [done, setDone] = useState(false)

  const scenario = WEATHER_SCENARIOS[scenarioIdx]
  const allOptions = shuffle([...scenario.items, ...scenario.wrong])
  const stars = correct >= 3 ? 3 : correct >= 2 ? 2 : 1

  const handleItem = (item: string) => {
    if (selected.has(item)) return
    const isCorrect = scenario.items.includes(item)
    if (isCorrect) {
      const next = new Set([...selected, item])
      setSelected(next)
      if (next.size === scenario.items.length) {
        setCorrect((c) => c + 1)
        const nextScene = scenarioIdx + 1
        if (nextScene >= WEATHER_SCENARIOS.length) {
          setDone(true)
        } else {
          setTimeout(() => {
            setScenarioIdx(nextScene)
            setSelected(new Set())
          }, 800)
        }
      }
    } else {
      setWrong(item)
      setTimeout(() => setWrong(null), 800)
    }
  }

  return (
    <GameShell level={level} onComplete={onComplete} completed={done} stars={stars}
      hint={`${scenario.weather}，要穿什麼？選出正確的衣服！`}>
      <ConfettiEffect show={done} />

      <div className="flex flex-col items-center gap-4 pt-2">
        {!done && (
          <>
            <motion.div
              key={scenarioIdx}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-[2rem] p-6 w-full text-center shadow-xl"
            >
              <div className="text-7xl">{scenario.weather.split(' ')[0]}</div>
              <p className="font-black text-gray-700 text-xl mt-2">{scenario.weather}</p>
              <p className="text-gray-400 text-sm mt-1">選出適合的衣物（{selected.size}/{scenario.items.length}）</p>
            </motion.div>

            <AnimatePresence>
              {wrong && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="bg-red-100 text-red-500 font-black rounded-2xl px-6 py-2">
                  這個不適合！
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-3 w-full">
              {allOptions.map((item) => {
                const isSelected = selected.has(item)
                const isWrong = wrong === item
                return (
                  <motion.button
                    key={item}
                    onClick={() => handleItem(item)}
                    whileHover={isSelected ? {} : { scale: 1.05 }}
                    whileTap={isSelected ? {} : { scale: 0.95 }}
                    animate={isWrong ? { x: [-5, 5, -5, 5, 0] } : {}}
                    className={`rounded-2xl py-4 px-4 font-bold shadow-md text-lg ${
                      isSelected ? 'bg-green-100 text-green-700' :
                      isWrong ? 'bg-red-100 text-red-500' : 'bg-white text-gray-700'
                    }`}
                    disabled={isSelected}
                  >
                    {item}
                    {isSelected && ' ✓'}
                  </motion.button>
                )
              })}
            </div>

            <div className="flex gap-2">
              {WEATHER_SCENARIOS.map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${i < scenarioIdx ? 'bg-green-400' : i === scenarioIdx ? 'bg-yellow-400' : 'bg-white/40'}`} />
              ))}
            </div>
          </>
        )}

        {done && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
            className="bg-white rounded-[2rem] p-8 text-center shadow-xl">
            <div className="text-7xl">👗</div>
            <h2 className="text-3xl font-black text-purple-600 mt-3">穿衣達人！</h2>
            <p className="text-gray-500 mt-2">你知道怎麼穿對衣服了！</p>
          </motion.div>
        )}
      </div>
    </GameShell>
  )
}
