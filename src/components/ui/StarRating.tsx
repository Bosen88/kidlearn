'use client'
import { motion } from 'framer-motion'

export default function StarRating({ stars, max = 3 }: { stars: number; max?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: i * 0.15, type: 'spring', stiffness: 300 }}
          className="text-2xl"
        >
          {i < stars ? '⭐' : '☆'}
        </motion.span>
      ))}
    </div>
  )
}
