'use client'
import { useParams, useRouter } from 'next/navigation'
import { GAME_LEVELS } from '@/lib/gameData'
import BrushTeethGame from '@/components/games/BrushTeethGame'
import WashHandsGame from '@/components/games/WashHandsGame'
import AlphabetGame from '@/components/games/AlphabetGame'
import AnimalsGame from '@/components/games/AnimalsGame'
import ColorsGame from '@/components/games/ColorsGame'
import ShapesGame from '@/components/games/ShapesGame'
import NumbersGame from '@/components/games/NumbersGame'
import EmotionsGame from '@/components/games/EmotionsGame'
import GetDressedGame from '@/components/games/GetDressedGame'
import TidyToysGame from '@/components/games/TidyToysGame'
import SizeSortGame from '@/components/games/SizeSortGame'
import ColorMatchGame from '@/components/games/ColorMatchGame'
import TimeGuard from '@/components/TimeGuard'

const GAME_MAP: Record<string, React.ComponentType<{ onComplete: (stars: number) => void }>> = {
  'brush-teeth': BrushTeethGame,
  'wash-hands': WashHandsGame,
  'get-dressed': GetDressedGame,
  'tidy-toys': TidyToysGame,
  'alphabet': AlphabetGame,
  'animals': AnimalsGame,
  'colors': ColorsGame,
  'numbers': NumbersGame,
  'shapes': ShapesGame,
  'color-match': ColorMatchGame,
  'size-sort': SizeSortGame,
  'emotions': EmotionsGame,
}

export default function LevelPage() {
  const { levelId } = useParams<{ levelId: string }>()
  const router = useRouter()
  const level = GAME_LEVELS.find((l) => l.id === levelId)
  const GameComponent = GAME_MAP[levelId]

  if (!level || !GameComponent) {
    router.push('/game')
    return null
  }

  return (
    <TimeGuard>
      <GameComponent onComplete={(stars) => {
        router.push(`/game/result?levelId=${levelId}&stars=${stars}`)
      }} />
    </TimeGuard>
  )
}
