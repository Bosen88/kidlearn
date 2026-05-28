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
import BigButton from '@/components/ui/BigButton'

const PAGE_BG = 'linear-gradient(160deg, #eef2ff 0%, #fdf4ff 100%)'
const PARENT_PIN = '1234'

export default function ParentPage() {
  const router = useRouter()
  const { parentSettings, setParentSettings, updateTimeSettings } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [pinVerified, setPinVerified] = useState(false)
  const [settings, setSettings] = useState<TimeSettings | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push('/auth/login'); return }
      const s = await getParentSettings(user.uid)
      if (s) { setParentSettings(s); setSettings(s.timeSettings) }
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
    <div className="min-h-screen flex items-center justify-center" style={{ background: PAGE_BG }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        className="text-6xl">⭐</motion.div>
    </div>
  )

  if (!pinVerified) return <PinScreen onVerify={(p) => { if (p === PARENT_PIN) setPinVerified(true) }} />

  const children = parentSettings?.children ?? []
  const totalLevels = GAME_LEVELS.length

  return (
    <div className="min-h-screen pb-10" style={{ background: PAGE_BG }}>

      {/* Header */}
      <div className="bg-white/90 backdrop-blur border-b border-gray-100 px-5 pt-5 pb-4 shadow-sm">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <h1 className="text-2xl font-black text-gray-800">家長後台 👨‍👩‍👧</h1>
            <p className="text-gray-400 text-sm font-semibold">{parentSettings?.email}</p>
          </div>
          <button
            onClick={async () => { await signOut(auth); router.push('/') }}
            className="bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl px-4 py-2 text-sm transition-colors"
          >
            登出
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">

        {/* Children */}
        <Section title="🧒 小朋友管理">
          <div className="grid grid-cols-2 gap-3">
            {children.map((child) => {
              const completedLevels = Object.values(child.progress ?? {}).filter((p) => p.completed).length
              return (
                <div key={child.id} className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                  <div className="text-4xl text-center mb-2">{child.avatar || '😊'}</div>
                  <p className="font-black text-gray-800 text-center">{child.name}</p>
                  <p className="text-yellow-600 text-center font-bold text-sm">⭐ {child.stars}</p>
                  <p className="text-gray-500 text-xs text-center mt-1">{completedLevels}/{totalLevels} 關完成</p>
                  <div className="w-full bg-indigo-100 rounded-full h-2 mt-2">
                    <div className="h-2 rounded-full bg-indigo-400"
                      style={{ width: `${(completedLevels / totalLevels) * 100}%` }} />
                  </div>
                </div>
              )
            })}
            <motion.button onClick={() => router.push('/parent/children')}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="rounded-2xl p-4 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-indigo-200 hover:border-indigo-400 transition-colors">
              <span className="text-4xl">➕</span>
              <span className="font-bold text-indigo-400 text-sm">新增小朋友</span>
            </motion.button>
          </div>
        </Section>

        {/* Time Settings */}
        {settings && (
          <Section title="⏰ 使用時間設定">
            <div className="space-y-5">
              <SliderSetting label="每日總時間上限" value={settings.dailyLimitMinutes}
                min={15} max={120} step={5} unit="分鐘"
                onChange={(v) => setSettings({ ...settings, dailyLimitMinutes: v })} />
              <SliderSetting label="連續使用上限" value={settings.sessionLimitMinutes}
                min={5} max={60} step={5} unit="分鐘"
                onChange={(v) => setSettings({ ...settings, sessionLimitMinutes: v })} />
              <SliderSetting label="休息時間" value={settings.breakDurationMinutes}
                min={3} max={30} step={1} unit="分鐘"
                onChange={(v) => setSettings({ ...settings, breakDurationMinutes: v })} />

              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">允許使用時段</label>
                <div className="flex items-center gap-3">
                  {[
                    { key: 'allowedHoursStart' as const, val: settings.allowedHoursStart },
                    { key: 'allowedHoursEnd' as const, val: settings.allowedHoursEnd },
                  ].map(({ key, val }, i) => (
                    <>
                      {i === 1 && <span key="sep" className="font-bold text-gray-500">到</span>}
                      <select key={key} value={val}
                        onChange={(e) => setSettings({ ...settings, [key]: +e.target.value })}
                        className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2.5 font-bold text-gray-700 bg-white focus:border-indigo-400 outline-none">
                        {Array.from({ length: 24 }).map((_, h) => (
                          <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                        ))}
                      </select>
                    </>
                  ))}
                </div>
              </div>

              <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                <p className="text-indigo-700 font-bold text-sm text-center leading-relaxed">
                  每次玩 <span className="font-black text-base text-indigo-900">{settings.sessionLimitMinutes}</span> 分鐘後，
                  需休息 <span className="font-black text-base text-indigo-900">{settings.breakDurationMinutes}</span> 分鐘，
                  每天最多 <span className="font-black text-base text-indigo-900">{settings.dailyLimitMinutes}</span> 分鐘
                </p>
              </div>

              <BigButton color={saved ? '#22c55e' : '#4f46e5'} onClick={handleSave} className="w-full font-black">
                {saved ? '✓ 已儲存！' : '儲存設定'}
              </BigButton>
            </div>
          </Section>
        )}

        {/* Quick actions */}
        <Section title="🔧 快速操作">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '🎮', label: '前往遊戲', path: '/', bg: 'bg-blue-50', text: 'text-blue-700' },
              { icon: '📊', label: '學習進度', path: '/parent/progress', bg: 'bg-green-50', text: 'text-green-700' },
            ].map((item) => (
              <motion.button key={item.label} onClick={() => router.push(item.path)}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className={`${item.bg} rounded-2xl p-4 text-center border border-gray-100`}>
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className={`font-bold text-sm ${item.text}`}>{item.label}</p>
              </motion.button>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100"
      style={{ boxShadow: '0 4px 0 #e0e7ff' }}>
      <h2 className="text-xl font-black text-gray-800 mb-4">{title}</h2>
      {children}
    </motion.div>
  )
}

function SliderSetting({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-bold text-gray-700">{label}</label>
        <span className="font-black text-indigo-600 bg-indigo-50 px-3 py-0.5 rounded-full text-sm">{value} {unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full accent-indigo-500 h-2" />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{min}{unit}</span><span>{max}{unit}</span>
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
      if (next === PARENT_PIN) { onVerify(next) }
      else { setError(true); setTimeout(() => { setPin(''); setError(false) }, 800) }
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5" style={{ background: PAGE_BG }}>
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="bg-white rounded-3xl p-8 w-full max-w-xs shadow-xl border border-gray-100 text-center"
        style={{ boxShadow: '0 8px 0 #c7d2fe' }}>

        <div className="text-6xl mb-3">🔒</div>
        <h2 className="text-2xl font-black text-gray-800">家長驗證</h2>
        <p className="text-gray-500 text-sm mt-1 mb-6 font-semibold">
          請輸入 4 位數 PIN 碼<br />
          <span className="text-gray-400 text-xs">(預設: 1234)</span>
        </p>

        {/* Dots */}
        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl font-black transition-colors ${
              error ? 'border-red-300 bg-red-50 text-red-400'
                : pin.length > i ? 'border-indigo-400 bg-indigo-50 text-indigo-600'
                : 'border-gray-200 bg-gray-50'
            }`}>
              {pin.length > i ? '●' : ''}
            </div>
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2.5">
          {[1,2,3,4,5,6,7,8,9,'',0,'←'].map((d, i) => (
            <motion.button key={i}
              onClick={() => {
                if (d === '←') setPin(p => p.slice(0, -1))
                else if (d !== '') handleDigit(String(d))
              }}
              whileHover={d !== '' ? { scale: 1.08 } : {}}
              whileTap={d !== '' ? { scale: 0.92 } : {}}
              className={`h-14 rounded-2xl font-black text-xl transition-colors ${
                d === '' ? '' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
              }`}
              style={d !== '' ? { boxShadow: '0 3px 0 #c7d2fe' } : {}}>
              {d}
            </motion.button>
          ))}
        </div>

        <button onClick={() => router.push('/')} className="mt-5 text-gray-400 text-sm font-semibold underline hover:text-gray-600">
          返回首頁
        </button>
      </motion.div>
    </div>
  )
}
