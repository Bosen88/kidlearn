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
  const { currentChild, parentSettings, setParentSettings } = useAppStore()
  const [saved, setSaved] = useState(false)

  const levelId = searchParams.get('levelId') ?? ''
  const stars = parseInt(searchParams.get('stars') ?? '1')
  const level = GAME_LEVELS.find((l) => l.id === levelId)

  useEffect(() => {
    if (!saved && currentChild && auth.currentUser) {
      setSaved(true)
      updateChildProgress(auth.currentUser.uid, currentChild.id, levelId, stars).then(() => {
        if (parentSettings) {
          const updatedChildren = parentSettings.children.map((c) => {
            if (c.id !== currentChild.id) return c
            const prev = c.progress?.[levelId]
            const newStars = Math.max(prev?.stars ?? 0, stars)
            const starDiff = newStars - (prev?.stars ?? 0)
            return {
              ...c,
              stars: c.stars + starDiff,
              progress: {
                ...c.progress,
                [levelId]: { completed: true, stars: newStars, playCount: (prev?.playCount ?? 0) + 1, lastPlayed: new Date() },
              },
            }
          })
          setParentSettings({ ...parentSettings, children: updatedChildren })
        }
      })
    }
  }, [saved, currentChild, levelId, stars, parentSettings, setParentSettings])

  const messages = [
    '太棒了！你好厲害！🎉',
    '你是超級小英雄！⭐',
    '繼續加油，你最棒！💪',
  ]
  const msg = messages[Math.min(stars - 1, 2)]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5">
      <ConfettiEffect show={stars >= 2} />

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="bg-white rounded-[2rem] p-8 w-full max-w-sm text-center shadow-2xl"
      >
        <CharacterSprite
          character={level?.character ?? 'sparky'}
          mood={stars >= 2 ? 'dancing' : 'happy'}
          size={100}
        />

        <h2 className="text-4xl font-black mt-4 text-purple-600">
          {stars === 3 ? '完美！' : stars === 2 ? '很棒！' : '繼續努力！'}
        </h2>
        <p className="text-gray-500 mt-2 text-lg">{msg}</p>

        <div className="flex justify-center mt-4">
          <StarRating stars={stars} />
        </div>

        <div className="bg-yellow-50 rounded-2xl p-4 mt-6">
          <p className="text-yellow-600 font-black text-2xl">+{stars} ⭐ 星星</p>
          <p className="text-gray-400 text-sm mt-1">加到你的寶貝集合！</p>
        </div>

        <div className="flex gap-3 mt-6">
          <BigButton
            color="#a8e6cf"
            onClick={() => router.push(`/game/${levelId}`)}
            className="flex-1 text-gray-700"
          >
            再玩一次
          </BigButton>
          <BigButton
            color="#a855f7"
            onClick={() => router.push('/game')}
            className="flex-1"
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
