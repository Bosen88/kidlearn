import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChildProfile, ParentSettings, SessionState, TimeSettings } from './types'

interface AppState {
  parentSettings: ParentSettings | null
  currentChild: ChildProfile | null
  session: SessionState | null
  isParentMode: boolean

  setParentSettings: (s: ParentSettings) => void
  setCurrentChild: (c: ChildProfile | null) => void
  updateChildStars: (childId: string, stars: number) => void
  startSession: (childId: string) => void
  endSession: () => void
  setBreak: (onBreak: boolean) => void
  setParentMode: (v: boolean) => void
  updateTimeSettings: (t: TimeSettings) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      parentSettings: null,
      currentChild: null,
      session: null,
      isParentMode: false,

      setParentSettings: (s) => set({ parentSettings: s }),

      setCurrentChild: (c) => set({ currentChild: c }),

      updateChildStars: (childId, addStars) => {
        const { parentSettings } = get()
        if (!parentSettings) return
        const children = parentSettings.children.map((c) =>
          c.id === childId ? { ...c, stars: c.stars + addStars } : c
        )
        set({ parentSettings: { ...parentSettings, children } })
      },

      startSession: (childId) =>
        set({
          session: {
            childId,
            startTime: new Date(),
            totalPlayedToday: get().session?.totalPlayedToday ?? 0,
            currentSessionStart: new Date(),
            isOnBreak: false,
            breakStartTime: null,
          },
        }),

      endSession: () =>
        set((state) => {
          if (!state.session?.currentSessionStart) return {}
          const played =
            (Date.now() - state.session.currentSessionStart.getTime()) / 1000 / 60
          return {
            session: {
              ...state.session,
              totalPlayedToday: state.session.totalPlayedToday + played,
              currentSessionStart: null,
            },
          }
        }),

      setBreak: (onBreak) =>
        set((state) => ({
          session: state.session
            ? {
                ...state.session,
                isOnBreak: onBreak,
                breakStartTime: onBreak ? new Date() : null,
              }
            : null,
        })),

      setParentMode: (v) => set({ isParentMode: v }),

      updateTimeSettings: (t) =>
        set((state) => ({
          parentSettings: state.parentSettings
            ? { ...state.parentSettings, timeSettings: t }
            : null,
        })),
    }),
    { name: 'kidlearn-store' }
  )
)
