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
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <motion.div
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="bg-white rounded-[2rem] p-10 mx-6 text-center max-w-sm shadow-2xl"
            >
              <CharacterSprite character="sparky" mood="dancing" size={100} />
              <h2 className="text-4xl font-black mt-4 text-purple-600">休息時間！</h2>
              <p className="text-gray-500 mt-2 text-lg">眼睛累了，讓我們休息一下 👀</p>

              <div className="mt-6 bg-purple-50 rounded-2xl p-4">
                <p className="text-gray-400 text-sm mb-1">還剩</p>
                <div className="text-6xl font-black text-purple-600 tabular-nums">
                  {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                </div>
              </div>

              <div className="mt-6 space-y-2 text-left">
                <p className="text-gray-500 text-sm">✅ 站起來動一動</p>
                <p className="text-gray-500 text-sm">✅ 看看遠方讓眼睛休息</p>
                <p className="text-gray-500 text-sm">✅ 喝點水補充能量</p>
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
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="bg-white rounded-[2rem] p-10 mx-6 text-center max-w-sm shadow-2xl"
            >
              <div className="text-8xl">🌙</div>
              <h2 className="text-4xl font-black mt-4 text-pink-600">今天玩夠了！</h2>
              <p className="text-gray-500 mt-2 text-lg">你今天學了好多，明天繼續！</p>
              <p className="text-gray-400 mt-4 text-sm">明天爸爸媽媽可以幫你繼續解鎖喔！</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
