'use client'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import CharacterSprite from './ui/CharacterSprite'
import BigButton from './ui/BigButton'

export default function TimeGuard({ children }: { children: React.ReactNode }) {
  const { session, parentSettings, setBreak, startSession, currentChild } = useAppStore()
  const [sessionElapsed, setSessionElapsed] = useState(0)
  const [showBreak, setShowBreak] = useState(false)
  const [breakRemaining, setBreakRemaining] = useState(0)
  const [showDailyLimit, setShowDailyLimit] = useState(false)

  const settings = parentSettings?.timeSettings
  const sessionLimit = (settings?.sessionLimitMinutes ?? 20) * 60
  const breakDuration = (settings?.breakDurationMinutes ?? 10) * 60
  const dailyLimit = (settings?.dailyLimitMinutes ?? 60) * 60

  // Track session elapsed time
  useEffect(() => {
    if (!session?.currentSessionStart || session.isOnBreak) return
    const interval = setInterval(() => {
      const elapsed = (Date.now() - new Date(session.currentSessionStart!).getTime()) / 1000
      setSessionElapsed(elapsed)

      // Check daily limit
      const totalToday = (session.totalPlayedToday ?? 0) * 60 + elapsed
      if (totalToday >= dailyLimit) {
        setShowDailyLimit(true)
      }

      // Trigger break
      if (elapsed >= sessionLimit && !showBreak) {
        setShowBreak(true)
        setBreak(true)
        setBreakRemaining(breakDuration)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [session, sessionLimit, breakDuration, dailyLimit, showBreak, setBreak])

  // Countdown break timer
  useEffect(() => {
    if (!showBreak) return
    const interval = setInterval(() => {
      setBreakRemaining((prev) => {
        if (prev <= 1) {
          setShowBreak(false)
          setBreak(false)
          setSessionElapsed(0)
          if (currentChild) startSession(currentChild.id)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [showBreak, setBreak, currentChild, startSession])

  const mins = Math.floor(breakRemaining / 60)
  const secs = breakRemaining % 60

  return (
    <>
      {children}

      {/* Break Screen */}
      <AnimatePresence>
        {showBreak && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-5"
            style={{ background: 'linear-gradient(160deg, #eef2ff 0%, #fdf4ff 100%)' }}
          >
            <motion.div
              initial={{ scale: 0.7, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm text-center shadow-2xl"
            >
              <CharacterSprite character="sparky" mood="dancing" size={90} />
              <h2 className="text-4xl font-black mt-4 text-gray-800">休息時間！</h2>
              <p className="text-gray-500 mt-2 text-base font-semibold">眼睛累了，讓我們休息一下 👀</p>

              <div className="mt-6 bg-indigo-50 rounded-2xl p-5">
                <p className="text-gray-400 text-sm font-semibold mb-2">倒數</p>
                <div className="text-6xl font-black text-indigo-600 tabular-nums tracking-tight">
                  {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                </div>
              </div>

              <div className="mt-5 space-y-2.5 text-left bg-gray-50 rounded-2xl p-4">
                {['站起來動一動 🏃', '看看遠方讓眼睛休息 👀', '喝點水補充能量 💧'].map((tip) => (
                  <p key={tip} className="text-gray-600 text-sm font-semibold">✅ {tip}</p>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Limit Screen */}
      <AnimatePresence>
        {showDailyLimit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-5"
            style={{ background: 'linear-gradient(160deg, #eef2ff 0%, #fdf4ff 100%)' }}
          >
            <motion.div
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 220 }}
              className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm text-center shadow-2xl"
            >
              <div className="text-8xl">🌙</div>
              <h2 className="text-4xl font-black mt-4 text-gray-800">今天玩夠了！</h2>
              <p className="text-gray-500 mt-3 text-base font-semibold">你今天學了好多，明天繼續！</p>
              <div className="mt-5 bg-indigo-50 rounded-2xl p-4">
                <p className="text-indigo-600 font-bold text-sm">明天爸爸媽媽可以幫你繼續解鎖喔 🔓</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
