'use client'
import { motion } from 'framer-motion'

const elements = ['⭐', '🌟', '✨', '💫', '🌈', '☁️', '🎈', '🎀']

export default function FloatingElements() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {elements.map((el, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl opacity-20"
          style={{
            left: `${10 + i * 12}%`,
            top: `${Math.random() * 80 + 5}%`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, i % 2 === 0 ? 10 : -10, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.3,
          }}
        >
          {el}
        </motion.div>
      ))}
    </div>
  )
}
