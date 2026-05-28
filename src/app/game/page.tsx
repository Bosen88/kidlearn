'use client'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { GAME_LEVELS, CATEGORY_INFO } from '@/lib/gameData'
import TimeGuard from '@/components/TimeGuard'
import CharacterSprite from '@/components/ui/CharacterSprite'

const BG = 'linear-gradient(160deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)'

export default function GamePage() {
  const router = useRouter()
  const { currentChild, setCurrentChild } = useAppStore()

  if (!currentChild) {
    router.push('/')
    return null
  }

  const categories = ['habits', 'english', 'cognitive'] as const
  const totalStars = currentChild.stars ?? 0

  return (
    <TimeGuard>
      <div className="min-h-screen pb-10" style={{ background: BG }}>

        {/* Header */}
        <div className="sticky top-0 z-20 px-4 pt-5 pb-3"
          style={{ background: 'rgba(30,27,75,0.85)', backdropFilter: 'blur(16px)' }}>
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <button
              onClick={() => { setCurrentChild(null); router.push('/') }}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl px-4 py-2.5 text-sm transition-colors"
            >
              ← 返回
            </button>

            {/* Child info */}
            <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-2">
              <span className="text-2xl">{currentChild.avatar || '😊'}</span>
              <div>
                <p className="text-white font-black text-sm leading-tight">{currentChild.name}</p>
                <p className="text-yellow-300 text-xs font-bold">⭐ {totalStars} 顆星</p>
              </div>
            </div>

            <button onClick={() => router.push('/parent')}
              className="bg-white/10 hover:bg-white/20 text-white rounded-2xl px-4 py-2.5 text-sm font-bold transition-colors">
              ⚙️
            </button>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 pt-5 space-y-4">

          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 bg-white/10 rounded-3xl p-4"
          >
            <CharacterSprite character="sparky" mood="excited" size={60} />
            <div>
              <p className="text-white font-black text-xl leading-tight">
                {currentChild.name}，今天學什麼？
              </p>
              <p className="text-white/60 text-sm font-semibold mt-0.5">選一個主題開始！</p>
            </div>
          </motion.div>

          {/* Category Cards */}
          {categories.map((cat, catIdx) => {
            const info = CATEGORY_INFO[cat]
            const levels = GAME_LEVELS.filter((l) => l.category === cat)
            const completedCount = levels.filter((l) => currentChild.progress?.[l.id]?.completed).length
            const pct = Math.round((completedCount / levels.length) * 100)

            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIdx * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden shadow-xl"
              >
                {/* Category header */}
                <div className={`bg-gradient-to-r ${info.bg} px-5 py-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{info.character}</span>
                      <div>
                        <h3 className="text-xl font-black text-white"
                          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
                          {info.label}
                        </h3>
                        <p className="text-white/80 text-xs font-semibold">{info.description}</p>
                      </div>
                    </div>
                    <div className="bg-white/25 rounded-xl px-3 py-1.5 text-center">
                      <p className="text-white font-black text-sm">{completedCount}/{levels.length}</p>
                      <p className="text-white/70 text-xs">完成</p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 bg-white/20 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-2 bg-white rounded-full"
                    />
                  </div>
                </div>

                {/* Level grid */}
                <div className="p-4 grid grid-cols-4 gap-3">
                  {levels.map((level, idx) => {
                    const progress = currentChild.progress?.[level.id]
                    const isCompleted = progress?.completed
                    const stars = progress?.stars ?? 0

                    return (
                      <motion.button
                        key={level.id}
                        onClick={() => router.push(`/game/${level.id}`)}
                        whileHover={{ scale: 1.08, y: -2 }}
                        whileTap={{ scale: 0.92 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: catIdx * 0.1 + idx * 0.05 }}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl relative"
                          style={{
                            background: isCompleted
                              ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                              : '#f3f4f6',
                            boxShadow: isCompleted
                              ? '0 4px 0 #d97706'
                              : '0 4px 0 #d1d5db',
                          }}
                        >
                          {level.icon}
                          {isCompleted && (
                            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center">
                              <span className="text-white text-xs font-black">✓</span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-bold text-gray-700 text-center leading-tight">
                          {level.title}
                        </span>
                        <div className="flex">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <span key={i} className="text-xs leading-none">
                              {i < stars ? '⭐' : '☆'}
                            </span>
                          ))}
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}

          {/* Star total */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 rounded-3xl p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-white font-black text-xl">⭐ {totalStars} 顆星</p>
              <p className="text-white/60 text-sm font-semibold">繼續玩，收集更多！</p>
            </div>
            <div className="flex flex-wrap gap-1 max-w-[140px] justify-end">
              {Array.from({ length: Math.min(totalStars, 15) }).map((_, i) => (
                <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: i * 0.03 }} className="text-base">
                  ⭐
                </motion.span>
              ))}
              {totalStars > 15 && (
                <span className="text-white/60 text-sm font-bold">+{totalStars - 15}</span>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </TimeGuard>
  )
}
