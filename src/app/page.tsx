'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import LandingPage from '@/components/church/landing-page'
import { AuthModal } from '@/components/church/auth-modal'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { SetupWizard } from '@/components/church/setup-wizard'

export default function Home() {
  const { isAuthenticated, isLoading, currentPage } = useAppStore()

  // Check for existing session on mount (simplified - no JWT for demo)
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('mychurch_user')
      if (savedUser) {
        const { user, church } = JSON.parse(savedUser)
        useAppStore.getState().login(user, church)
      } else {
        // No saved session - mark loading as done
        useAppStore.getState().setUser(null)
      }
    } catch {
      localStorage.removeItem('mychurch_user')
      useAppStore.getState().setUser(null)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  // Setup wizard takes priority over everything
  if (currentPage === 'setup-wizard') {
    return <SetupWizard />
  }

  return (
    <>
      {isAuthenticated ? (
        <DashboardLayout />
      ) : (
        <LandingPage />
      )}
      <AuthModal />
    </>
  )
}
