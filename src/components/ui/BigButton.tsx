'use client'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  onClick?: () => void
  color?: string
  disabled?: boolean
  className?: string
}

export default function BigButton({ children, onClick, color = '#4d96ff', disabled, className = '' }: Props) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`relative px-8 py-4 rounded-3xl text-white font-bold text-xl shadow-lg select-none ${className}`}
      style={{
        backgroundColor: disabled ? '#ccc' : color,
        boxShadow: disabled ? 'none' : `0 6px 0 ${darken(color)}`,
      }}
      whileHover={disabled ? {} : { scale: 1.05, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.95, y: 4, boxShadow: 'none' }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {children}
    </motion.button>
  )
}

function darken(hex: string): string {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, ((n >> 16) & 0xff) - 40)
  const g = Math.max(0, ((n >> 8) & 0xff) - 40)
  const b = Math.max(0, (n & 0xff) - 40)
  return `rgb(${r},${g},${b})`
}
