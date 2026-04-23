import { create } from 'zustand'

export type AppPage =
  | 'landing'
  | 'setup-wizard'
  | 'dashboard'
  | 'dashboard-members'
  | 'dashboard-activities'
  | 'dashboard-appointments'
  | 'dashboard-groups'
  | 'dashboard-finances'
  | 'dashboard-certificates'
  | 'dashboard-cemetery'
  | 'dashboard-communication'
  | 'dashboard-settings'
  | 'dashboard-billing'

export type AuthModalTab = 'login' | 'register'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  avatarUrl?: string
  role: string
  churchId?: string | null
  isActive: boolean
  emailVerified: boolean
}

export interface Church {
  id: string
  name: string
  slug: string
  address?: string
  phone?: string
  email?: string
  logoUrl?: string
  photoUrl?: string
  motto?: string
  description?: string
  primaryColor?: string
  secondaryColor?: string
  plan?: string
  numberOfFaithful?: number
}

interface AppState {
  // Navigation
  currentPage: AppPage
  setPage: (page: AppPage) => void

  // Auth modal
  authModalOpen: boolean
  authModalTab: AuthModalTab
  setAuthModal: (open: boolean, tab?: AuthModalTab) => void

  // Auth
  user: User | null
  church: Church | null
  churchId: string | null
  userId: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User, church: Church | null) => void
  logout: () => void
  setUser: (user: User | null) => void

  // Sidebar
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void

  // Notifications
  notificationCount: number
  setNotificationCount: (count: number) => void
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentPage: 'landing',
  setPage: (page) => set({ currentPage: page }),

  // Auth modal
  authModalOpen: false,
  authModalTab: 'login',
  setAuthModal: (open, tab = 'login') =>
    set({ authModalOpen: open, authModalTab: tab }),

  // Auth
  user: null,
  church: null,
  churchId: null,
  userId: null,
  isAuthenticated: false,
  isLoading: true,
  login: (user, church) => {
    set({
      user,
      church: church ?? null,
      churchId: church?.id ?? user.churchId ?? null,
      userId: user.id,
      isAuthenticated: true,
      isLoading: false,
      currentPage: 'dashboard',
      authModalOpen: false,
    })
    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('mychurch_user', JSON.stringify({ user, church }))
    }
  },
  logout: () => {
    set({
      user: null,
      church: null,
      churchId: null,
      userId: null,
      isAuthenticated: false,
      isLoading: false,
      currentPage: 'landing',
      sidebarOpen: true,
    })
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mychurch_user')
    }
  },
  setUser: (user) =>
    set({
      user,
      userId: user?.id ?? null,
      isAuthenticated: !!user,
      isLoading: false,
    }),

  // Sidebar
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Notifications
  notificationCount: 3,
  setNotificationCount: (count) => set({ notificationCount: count }),
}))
