'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { saveChildProfile } from '@/lib/firestoreService'
import { useAppStore } from '@/lib/store'
import BigButton from '@/components/ui/BigButton'
import type { ChildProfile } from '@/lib/types'

const AVATARS = ['😊', '🐣', '🐸', '🦄', '🐶', '🐱', '🐼', '🐨', '🦊', '🐰', '🐯', '🦁']
const AGES = [2, 3, 4, 5]

export default function ChildrenPage() {
  const router = useRouter()
  const { parentSettings, setParentSettings } = useAppStore()
  const [name, setName] = useState('')
  const [age, setAge] = useState(3)
  const [avatar, setAvatar] = useState('😊')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const handleSave = async () => {
    if (!name.trim() || !auth.currentUser) return
    setSaving(true)
    const child: ChildProfile = {
      id: Date.now().toString(),
      name: name.trim(),
      avatar,
      age,
      stars: 0,
      badges: [],
      progress: {},
      createdAt: new Date(),
    }
    await saveChildProfile(auth.currentUser.uid, child)
    if (parentSettings) {
      setParentSettings({
        ...parentSettings,
        children: [...parentSettings.children, child],
      })
    }
    setSaving(false)
    setDone(true)
    setTimeout(() => router.push('/'), 1500)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5"
      style={{ background: 'linear-gradient(160deg, #eef2ff 0%, #fdf4ff 100%)' }}>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl relative z-10"
      >
        {done ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-center">
            <div className="text-8xl">{avatar}</div>
            <h2 className="text-3xl font-black text-purple-600 mt-4">歡迎 {name}！</h2>
            <p className="text-gray-400 mt-2">帳號建立成功！</p>
          </motion.div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="text-6xl mb-2">🧒</div>
              <h1 className="text-2xl font-black text-purple-600">建立小朋友帳號</h1>
            </div>

            {/* Avatar Select */}
            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-600 mb-2">選擇頭像</label>
              <div className="grid grid-cols-6 gap-2">
                {AVATARS.map((a) => (
                  <motion.button
                    key={a}
                    onClick={() => setAvatar(a)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className={`text-3xl rounded-xl py-1.5 ${
                      avatar === a ? 'bg-purple-100 ring-2 ring-purple-400' : 'bg-gray-50'
                    }`}
                  >
                    {a}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-600 mb-1">小朋友的名字</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-2 border-purple-100 rounded-2xl px-4 py-3 text-gray-700 font-bold focus:outline-none focus:border-purple-400"
                placeholder="輸入名字..."
                maxLength={10}
              />
            </div>

            {/* Age */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-600 mb-2">年齡</label>
              <div className="flex gap-2">
                {AGES.map((a) => (
                  <motion.button
                    key={a}
                    onClick={() => setAge(a)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`flex-1 py-3 rounded-2xl font-black text-lg ${
                      age === a ? 'bg-purple-500 text-white' : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    {a}
                  </motion.button>
                ))}
              </div>
            </div>

            <BigButton
              color="#a855f7"
              onClick={handleSave}
              disabled={!name.trim() || saving}
              className="w-full"
            >
              {saving ? '建立中...' : `建立 ${avatar} ${name || '帳號'}`}
            </BigButton>

            <button onClick={() => router.push('/')} className="block text-center text-gray-400 text-sm mt-4 underline w-full">
              跳過
            </button>
          </>
        )}
      </motion.div>
    </div>
  )
}
