'use client'
import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const COLORS = ['#ff6b9d', '#ffd93d', '#6bcb77', '#4d96ff', '#c77dff', '#ff9f43']

function Particle({ color, x, delay }: { color: string; x: number; delay: number }) {
  return (
    <motion.div
      className="absolute w-3 h-3 rounded-full top-0 pointer-events-none"
      style={{ left: `${x}%`, backgroundColor: color }}
      initial={{ y: -20, opacity: 1, scale: 1 }}
      animate={{
        y: [0, 200, 400],
        x: [0, (Math.random() - 0.5) * 100],
        opacity: [1, 1, 0],
        scale: [1, 0.8, 0.4],
        rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
      }}
      transition={{ duration: 1.5, delay, ease: 'easeOut' }}
    />
  )
}

export default function ConfettiEffect({ show }: { show: boolean }) {
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    color: COLORS[i % COLORS.length],
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
  }))

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((p) => (
            <Particle key={p.id} color={p.color} x={p.x} delay={p.delay} />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}
