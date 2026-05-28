'use client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { GAME_LEVELS, CATEGORY_INFO } from '@/lib/gameData'
import FloatingElements from '@/components/FloatingElements'

export default function ProgressPage() {
  const router = useRouter()
  const { parentSettings } = useAppStore()
  const children = parentSettings?.children ?? []

  return (
    <div className="min-h-screen pb-10 relative overflow-hidden">
      <FloatingElements />

      <div className="relative z-10 px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => router.push('/parent')} className="bg-white/30 backdrop-blur text-white font-bold rounded-2xl px-4 py-2 text-sm">
          ← 返回
        </button>
        <h1 className="text-2xl font-black text-white">📊 學習進度</h1>
      </div>

      <div className="relative z-10 px-5 space-y-5">
        {children.map((child) => (
          <motion.div key={child.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[1.5rem] p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{child.avatar}</span>
              <div>
                <h2 className="text-xl font-black text-gray-700">{child.name}</h2>
                <p className="text-yellow-500 font-bold">⭐ {child.stars} 顆星</p>
              </div>
            </div>

            {(['habits', 'english', 'cognitive'] as const).map((cat) => {
              const info = CATEGORY_INFO[cat]
              const levels = GAME_LEVELS.filter((l) => l.category === cat)
              const completed = levels.filter((l) => child.progress?.[l.id]?.completed).length

              return (
                <div key={cat} className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-600 text-sm">{info.character} {info.label}</span>
                    <span className="font-black text-gray-700">{completed}/{levels.length}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(completed / levels.length) * 100}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-3 rounded-full bg-gradient-to-r ${info.bg}`}
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 mt-2">
                    {levels.map((level) => {
                      const prog = child.progress?.[level.id]
                      return (
                        <div key={level.id} className={`rounded-xl p-1.5 text-center ${prog?.completed ? 'bg-green-50' : 'bg-gray-50'}`}>
                          <div className="text-xl">{level.icon}</div>
                          {prog?.completed && (
                            <div className="flex justify-center">
                              {Array.from({ length: 3 }).map((_, i) => (
                                <span key={i} className="text-xs">{i < (prog.stars ?? 0) ? '⭐' : '☆'}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </motion.div>
        ))}

        {children.length === 0 && (
          <div className="bg-white rounded-[1.5rem] p-8 text-center shadow-lg">
            <div className="text-6xl">👶</div>
            <p className="font-black text-gray-500 mt-3">還沒有小朋友帳號</p>
            <button onClick={() => router.push('/parent/children')}
              className="mt-3 text-purple-500 font-bold underline">
              建立帳號
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
