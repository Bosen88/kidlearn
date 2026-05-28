import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { ParentSettings, TimeSettings, ChildProfile } from './types'

export async function getParentSettings(uid: string): Promise<ParentSettings | null> {
  const ref = doc(db, 'parents', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return snap.data() as ParentSettings
}

export async function createParentSettings(uid: string, email: string): Promise<ParentSettings> {
  const defaultSettings: ParentSettings = {
    uid,
    email,
    children: [],
    timeSettings: {
      dailyLimitMinutes: 60,
      sessionLimitMinutes: 20,
      breakDurationMinutes: 10,
      allowedHoursStart: 8,
      allowedHoursEnd: 20,
      weekendOnly: false,
    },
    unlockedThemes: ['default'],
    createdAt: new Date(),
  }
  await setDoc(doc(db, 'parents', uid), { ...defaultSettings, createdAt: serverTimestamp() })
  return defaultSettings
}

export async function saveTimeSettings(uid: string, settings: TimeSettings): Promise<void> {
  await updateDoc(doc(db, 'parents', uid), { timeSettings: settings })
}

export async function saveChildProfile(uid: string, child: ChildProfile): Promise<void> {
  const ref = doc(db, 'parents', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const data = snap.data() as ParentSettings
  const children = data.children.filter((c) => c.id !== child.id)
  children.push(child)
  await updateDoc(ref, { children })
}

export async function updateChildProgress(
  uid: string,
  childId: string,
  levelId: string,
  stars: number
): Promise<void> {
  const ref = doc(db, 'parents', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const data = snap.data() as ParentSettings
  const children = data.children.map((c) => {
    if (c.id !== childId) return c
    const prev = c.progress[levelId]
    const newStars = Math.max(prev?.stars ?? 0, stars)
    const totalStars = c.stars - (prev?.stars ?? 0) + newStars
    return {
      ...c,
      stars: totalStars,
      progress: {
        ...c.progress,
        [levelId]: {
          completed: true,
          stars: newStars,
          playCount: (prev?.playCount ?? 0) + 1,
          lastPlayed: new Date(),
        },
      },
    }
  })
  await updateDoc(ref, { children })
}
