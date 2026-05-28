'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { updateChildProgress } from '@/lib/firestoreService'
import { auth } from '@/lib/firebase'
import { GAME_LEVELS } from '@/lib/gameData'
import ConfettiEffect from '@/components/ui/ConfettiEffect'
import StarRating from '@/components/ui/StarRating'
import CharacterSprite from '@/components/ui/CharacterSprite'
import BigButton from '@/components/ui/BigButton'

function ResultContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { currentChild, parentSettings, setParentSettings, setCurrentChild } = useAppStore()
  const [saved, setSaved] = useState(false)
  const [earnedStars, setEarnedStars] = useState(0)

  const levelId = searchParams.get('levelId') ?? ''
  const stars = parseInt(searchParams.get('stars') ?? '1')
  const level = GAME_LEVELS.find((l) => l.id === levelId)

  useEffect(() => {
    if (saved || !currentChild || !auth.currentUser || !parentSettings) return
    setSaved(true)

    const prev = currentChild.progress?.[levelId]
    const newStars = Math.max(prev?.stars ?? 0, stars)
    const starDiff = newStars - (prev?.stars ?? 0)
    setEarnedStars(starDiff)

    // 更新本地 store — parentSettings + currentChild 同步
    const updatedChildren = parentSettings.children.map((c) => {
      if (c.id !== currentChild.id) return c
      return {
        ...c,
        stars: c.stars + starDiff,
        progress: {
          ...c.progress,
          [levelId]: {
            completed: true,
            stars: newStars,
            playCount: (prev?.playCount ?? 0) + 1,
            lastPlayed: new Date(),
          },
        },
      }
    })

    const updatedSettings = { ...parentSettings, children: updatedChildren }
    setParentSettings(updatedSettings)

    // 同步更新 currentChild，讓返回遊戲地圖時星星正確
    const updatedChild = updatedChildren.find((c) => c.id === currentChild.id)
    if (updatedChild) setCurrentChild(updatedChild)

    // 寫入 Firestore
    updateChildProgress(auth.currentUser.uid, currentChild.id, levelId, stars)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const messages = ['繼續加油，你最棒！💪', '你是超級小英雄！⭐', '太棒了！你好厲害！🎉']
  const msg = messages[Math.min(stars - 1, 2)]

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5"
      style={{ background: 'linear-gradient(160deg, #667eea 0%, #764ba2 100%)' }}
    >
      <ConfettiEffect show={stars >= 2} />

      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm text-center shadow-2xl"
      >
        <CharacterSprite
          character={level?.character ?? 'sparky'}
          mood={stars >= 2 ? 'dancing' : 'happy'}
          size={100}
        />

        <h2 className="text-4xl font-black mt-4 text-gray-800">
          {stars === 3 ? '完美！🏆' : stars === 2 ? '很棒！🎉' : '繼續努力！💪'}
        </h2>
        <p className="text-gray-500 mt-2 text-lg font-semibold">{msg}</p>

        <div className="flex justify-center mt-5">
          <StarRating stars={stars} />
        </div>

        {/* Stars earned */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className="mt-5 rounded-2xl p-4"
          style={{ background: 'linear-gradient(135deg, #ffd93d, #ff9f43)' }}
        >
          <p className="text-white font-black text-3xl">
            {earnedStars > 0 ? `+${earnedStars} ⭐` : `⭐ × ${stars}`}
          </p>
          <p className="text-white/80 text-sm font-semibold mt-1">
            {earnedStars > 0 ? '新增到你的收藏！' : '已是最高分！'}
          </p>
          {currentChild && (
            <p className="text-white/70 text-xs mt-1">
              累積星星：{(currentChild.stars ?? 0) + earnedStars} ⭐
            </p>
          )}
        </motion.div>

        <div className="flex gap-3 mt-6">
          <BigButton
            color="#e0e7ff"
            onClick={() => router.push(`/game/${levelId}`)}
            className="flex-1 text-purple-700 font-black"
          >
            再玩一次
          </BigButton>
          <BigButton
            color="#7c3aed"
            onClick={() => router.push('/game')}
            className="flex-1 font-black"
          >
            繼續玩 →
          </BigButton>
        </div>
      </motion.div>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense>
      <ResultContent />
    </Suspense>
  )
}
