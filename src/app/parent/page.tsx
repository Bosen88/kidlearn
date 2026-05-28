'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getParentSettings, saveTimeSettings } from '@/lib/firestoreService'
import { useAppStore } from '@/lib/store'
import { GAME_LEVELS } from '@/lib/gameData'
import type { TimeSettings } from '@/lib/types'
import FloatingElements from '@/components/FloatingElements'
import BigButton from '@/components/ui/BigButton'

export default function ParentPage() {
  const router = useRouter()
  const { parentSettings, setParentSettings, updateTimeSettings } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [pinInput, setPinInput] = useState('')
  const [pinVerified, setPinVerified] = useState(false)
  const [settings, setSettings] = useState<TimeSettings | null>(null)
  const [saved, setSaved] = useState(false)

  const PARENT_PIN = '1234'

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push('/auth/login'); return }
      const s = await getParentSettings(user.uid)
      if (s) {
        setParentSettings(s)
        setSettings(s.timeSettings)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [router, setParentSettings])

  const handleSave = async () => {
    if (!settings || !auth.currentUser) return
    await saveTimeSettings(auth.currentUser.uid, settings)
    updateTimeSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="text-7xl">⭐</motion.div>
    </div>
  )

  if (!pinVerified) return <PinScreen onVerify={(p) => { if (p === PARENT_PIN) setPinVerified(true) }} />

  const children = parentSettings?.children ?? []
  const totalLevels = GAME_LEVELS.length

  return (
    <div className="min-h-screen pb-10 relative overflow-hidden">
      <FloatingElements />

      {/* Header */}
      <div className="relative z-10 px-5 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">家長後台 👨‍👩‍👧</h1>
          <p className="text-white/70 text-sm">{parentSettings?.email}</p>
        </div>
        <button
          onClick={async () => { await signOut(auth); router.push('/') }}
          className="bg-white/30 backdrop-blur text-white font-bold rounded-2xl px-4 py-2 text-sm"
        >
          登出
        </button>
      </div>

      <div className="relative z-10 px-5 space-y-5">
        {/* Children Overview */}
        <Section title="🧒 小朋友管理">
          <div className="grid grid-cols-2 gap-3">
            {children.map((child) => {
              const completedLevels = Object.values(child.progress ?? {}).filter((p) => p.completed).length
              return (
                <motion.div key={child.id} whileHover={{ scale: 1.02 }} className="bg-gray-50 rounded-2xl p-4">
                  <div className="text-4xl text-center mb-2">{child.avatar || '😊'}</div>
                  <p className="font-black text-gray-700 text-center">{child.name}</p>
                  <p className="text-yellow-500 text-center font-bold">⭐ {child.stars}</p>
                  <p className="text-gray-400 text-xs text-center">{completedLevels}/{totalLevels} 關完成</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div className="h-1.5 rounded-full bg-green-400" style={{ width: `${(completedLevels / totalLevels) * 100}%` }} />
                  </div>
                </motion.div>
              )
            })}
            <motion.button
              onClick={() => router.push('/parent/children')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-purple-50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-purple-200"
            >
              <span className="text-4xl">➕</span>
              <span className="font-bold text-purple-500 text-sm">新增小朋友</span>
            </motion.button>
          </div>
        </Section>

        {/* Time Settings */}
        {settings && (
          <Section title="⏰ 使用時間設定">
            <div className="space-y-4">
              <SliderSetting
                label="每日總時間上限"
                value={settings.dailyLimitMinutes}
                min={15} max={120} step={5}
                unit="分鐘"
                onChange={(v) => setSettings({ ...settings, dailyLimitMinutes: v })}
              />
              <SliderSetting
                label="連續使用上限"
                value={settings.sessionLimitMinutes}
                min={5} max={60} step={5}
                unit="分鐘"
                onChange={(v) => setSettings({ ...settings, sessionLimitMinutes: v })}
              />
              <SliderSetting
                label="休息時間"
                value={settings.breakDurationMinutes}
                min={3} max={30} step={1}
                unit="分鐘"
                onChange={(v) => setSettings({ ...settings, breakDurationMinutes: v })}
              />
              <div>
                <label className="text-sm font-bold text-gray-600 block mb-2">允許使用時段</label>
                <div className="flex items-center gap-3">
                  <select
                    value={settings.allowedHoursStart}
                    onChange={(e) => setSettings({ ...settings, allowedHoursStart: +e.target.value })}
                    className="border-2 border-purple-100 rounded-xl px-3 py-2 font-bold text-gray-700"
                  >
                    {Array.from({ length: 24 }).map((_, h) => (
                      <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                    ))}
                  </select>
                  <span className="font-bold text-gray-500">到</span>
                  <select
                    value={settings.allowedHoursEnd}
                    onChange={(e) => setSettings({ ...settings, allowedHoursEnd: +e.target.value })}
                    className="border-2 border-purple-100 rounded-xl px-3 py-2 font-bold text-gray-700"
                  >
                    {Array.from({ length: 24 }).map((_, h) => (
                      <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                    ))}
                  </select>
                </div>
              </div>

              <BigButton color={saved ? '#22c55e' : '#a855f7'} onClick={handleSave} className="w-full">
                {saved ? '✓ 已儲存！' : '儲存設定'}
              </BigButton>
            </div>

            {/* Summary */}
            <div className="mt-4 bg-purple-50 rounded-2xl p-4">
              <p className="text-purple-600 font-bold text-sm text-center">
                每次玩 <span className="font-black text-lg">{settings.sessionLimitMinutes}</span> 分鐘後
                需休息 <span className="font-black text-lg">{settings.breakDurationMinutes}</span> 分鐘，
                每天最多 <span className="font-black text-lg">{settings.dailyLimitMinutes}</span> 分鐘
              </p>
            </div>
          </Section>
        )}

        {/* Quick Actions */}
        <Section title="🔧 快速操作">
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={() => router.push('/')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-blue-50 rounded-2xl p-4 text-center"
            >
              <div className="text-3xl mb-2">🎮</div>
              <p className="font-bold text-gray-700 text-sm">前往遊戲</p>
            </motion.button>
            <motion.button
              onClick={() => router.push('/parent/progress')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-green-50 rounded-2xl p-4 text-center"
            >
              <div className="text-3xl mb-2">📊</div>
              <p className="font-bold text-gray-700 text-sm">學習進度</p>
            </motion.button>
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[1.5rem] p-5 shadow-lg">
      <h2 className="text-xl font-black text-gray-700 mb-4">{title}</h2>
      {children}
    </motion.div>
  )
}

function SliderSetting({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-bold text-gray-600">{label}</label>
        <span className="font-black text-purple-600">{value} {unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full accent-purple-500"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}

function PinScreen({ onVerify }: { onVerify: (pin: string) => void }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const router = useRouter()

  const handleDigit = (d: string) => {
    const next = pin + d
    setPin(next)
    if (next.length === 4) {
      if (next === '1234') { onVerify(next) }
      else { setError(true); setTimeout(() => { setPin(''); setError(false) }, 800) }
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 relative overflow-hidden">
      <FloatingElements />
      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-white rounded-[2rem] p-8 w-full max-w-xs shadow-2xl relative z-10 text-center">
        <div className="text-6xl mb-3">🔒</div>
        <h2 className="text-2xl font-black text-purple-600">家長驗證</h2>
        <p className="text-gray-400 text-sm mt-1 mb-6">請輸入4位數PIN碼<br /><span className="text-xs">(預設: 1234)</span></p>

        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-2xl font-black ${
              error ? 'border-red-400 bg-red-50' :
              pin.length > i ? 'border-purple-400 bg-purple-50' : 'border-gray-200'
            }`}>
              {pin.length > i ? '●' : ''}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[1,2,3,4,5,6,7,8,9,'',0,'←'].map((d, i) => (
            <motion.button
              key={i}
              onClick={() => {
                if (d === '←') setPin(p => p.slice(0, -1))
                else if (d !== '') handleDigit(String(d))
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`h-14 rounded-2xl font-black text-xl ${d === '' ? '' : 'bg-purple-50 text-purple-700 shadow-md'}`}
            >
              {d}
            </motion.button>
          ))}
        </div>

        <button onClick={() => router.push('/')} className="mt-4 text-gray-400 text-sm underline">返回首頁</button>
      </motion.div>
    </div>
  )
}
