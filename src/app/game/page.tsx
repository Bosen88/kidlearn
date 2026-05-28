'use client'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { GAME_LEVELS, CATEGORY_INFO } from '@/lib/gameData'
import TimeGuard from '@/components/TimeGuard'
import FloatingElements from '@/components/FloatingElements'
import CharacterSprite from '@/components/ui/CharacterSprite'

export default function GamePage() {
  const router = useRouter()
  const { currentChild, parentSettings, setCurrentChild } = useAppStore()

  if (!currentChild) {
    router.push('/')
    return null
  }

  const categories = ['habits', 'english', 'cognitive'] as const

  return (
    <TimeGuard>
      <div className="min-h-screen relative overflow-hidden pb-10">
        <FloatingElements />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-5 pt-6 pb-4">
          <button
            onClick={() => { setCurrentChild(null); router.push('/') }}
            className="bg-white/30 backdrop-blur text-white font-bold rounded-2xl px-4 py-2 text-sm"
          >
            ← 返回
          </button>

          <div className="flex items-center gap-2 bg-white/30 backdrop-blur rounded-2xl px-4 py-2">
            <span className="text-2xl">{currentChild.avatar || '😊'}</span>
            <div>
              <p className="text-white font-black text-sm">{currentChild.name}</p>
              <p className="text-white/80 text-xs">⭐ {currentChild.stars} 顆星</p>
            </div>
          </div>

          <button
            onClick={() => router.push('/parent')}
            className="bg-white/30 backdrop-blur text-white font-bold rounded-2xl px-4 py-2 text-sm"
          >
            👨‍👩‍👧
          </button>
        </div>

        {/* Main Character */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center mb-6"
        >
          <CharacterSprite character="sparky" mood="excited" size={90} />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl px-5 py-2 mt-2 shadow-lg"
          >
            <p className="text-gray-700 font-black text-lg">
              {currentChild.name}，今天要學什麼？ 🎯
            </p>
          </motion.div>
        </motion.div>

        {/* Category Cards */}
        <div className="relative z-10 px-5 space-y-4">
          {categories.map((cat, catIdx) => {
            const info = CATEGORY_INFO[cat]
            const levels = GAME_LEVELS.filter((l) => l.category === cat)
            const completedCount = levels.filter(
              (l) => currentChild.progress?.[l.id]?.completed
            ).length

            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: catIdx * 0.15 }}
                className="bg-white rounded-[1.5rem] overflow-hidden shadow-lg"
              >
                {/* Category Header */}
                <div className={`bg-gradient-to-r ${info.bg} p-4 flex items-center gap-3`}>
                  <span className="text-4xl">{info.character}</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-white">{info.label}</h3>
                    <p className="text-white/80 text-sm">{info.description}</p>
                  </div>
                  <div className="bg-white/30 rounded-xl px-3 py-1 text-white font-bold text-sm">
                    {completedCount}/{levels.length}
                  </div>
                </div>

                {/* Levels Grid */}
                <div className="p-4 grid grid-cols-4 gap-3">
                  {levels.map((level, idx) => {
                    const progress = currentChild.progress?.[level.id]
                    const isCompleted = progress?.completed
                    const stars = progress?.stars ?? 0

                    return (
                      <motion.button
                        key={level.id}
                        onClick={() => router.push(`/game/${level.id}`)}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        className="flex flex-col items-center gap-1"
                      >
                        <div
                          className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-md ${
                            isCompleted
                              ? 'bg-gradient-to-br from-yellow-300 to-orange-400'
                              : 'bg-gray-50 border-2 border-dashed border-gray-200'
                          }`}
                          style={isCompleted ? { boxShadow: '0 4px 0 rgba(200,100,0,0.3)' } : {}}
                        >
                          {level.icon}
                        </div>
                        <span className="text-xs font-bold text-gray-600 text-center leading-tight">
                          {level.title}
                        </span>
                        {isCompleted && (
                          <div className="flex">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <span key={i} className="text-xs">{i < stars ? '⭐' : '☆'}</span>
                            ))}
                          </div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Stars Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative z-10 mx-5 mt-4 bg-white/30 backdrop-blur rounded-[1.5rem] p-4 flex items-center justify-between"
        >
          <div className="text-white">
            <p className="font-black text-xl">⭐ {currentChild.stars} 顆星</p>
            <p className="text-white/70 text-sm">繼續收集更多！</p>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(currentChild.stars, 10) }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="text-xl"
              >
                ⭐
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </TimeGuard>
  )
}
