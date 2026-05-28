'use client'
import { motion, type TargetAndTransition } from 'framer-motion'

type Character = 'peep' | 'hoppy' | 'luna' | 'sparky'
type Mood = 'happy' | 'excited' | 'thinking' | 'sad' | 'dancing'

const CHAR_EMOJI: Record<Character, string> = {
  sparky: '⭐',
  peep: '🐣',
  hoppy: '🐸',
  luna: '🦄',
}

const moodVariants: Record<Mood, TargetAndTransition> = {
  happy: { rotate: [0, 5, -5, 0], transition: { repeat: Infinity, duration: 2 } },
  excited: { scale: [1, 1.2, 1], transition: { repeat: Infinity, duration: 0.5 } },
  thinking: { rotate: [0, -10, 0], transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' } },
  sad: { y: [0, 5, 0], transition: { repeat: Infinity, duration: 1.5 } },
  dancing: {
    rotate: [0, 15, -15, 15, 0],
    y: [0, -10, 0, -10, 0],
    transition: { repeat: Infinity, duration: 0.8 },
  },
}

interface Props {
  character: Character
  mood?: Mood
  size?: number
  onClick?: () => void
}

export default function CharacterSprite({ character, mood = 'happy', size = 80, onClick }: Props) {
  return (
    <motion.div
      animate={moodVariants[mood]}
      className="cursor-pointer select-none"
      style={{ fontSize: size }}
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
    >
      {CHAR_EMOJI[character]}
    </motion.div>
  )
}
