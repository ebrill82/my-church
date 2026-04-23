'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Church,
  LayoutDashboard,
  Users,
  Calendar,
  CalendarCheck,
  UsersRound,
  Wallet,
  FileText,
  Cross,
  Megaphone,
  Settings,
  Menu,
  Search,
  Bell,
  LogOut,
  User,
  CreditCard,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useAppStore, type AppPage } from '@/lib/store'
import { toast } from 'sonner'
import CommunicationPage from '@/components/dashboard/pages/communication-page'
import SettingsPage from '@/components/dashboard/pages/settings-page'
import CemeteryPage from '@/components/dashboard/pages/cemetery-page'
import BillingPage from '@/components/dashboard/pages/billing-page'
import MembersPage from '@/components/dashboard/pages/members-page'
import ActivitiesPage from '@/components/dashboard/pages/activities-page'
import AppointmentsPage from '@/components/dashboard/pages/appointments-page'
import GroupsPage from '@/components/dashboard/pages/groups-page'
import FinancesPage from '@/components/dashboard/pages/finances-page'
import CertificatesPage from '@/components/dashboard/pages/certificates-page'
import DashboardMainPage from '@/components/dashboard/pages/dashboard-page'

// ─── Navigation items ──────────────────────────────────────────────────

const navItems: {
  icon: React.ElementType
  label: string
  page: AppPage
  premium?: boolean
}[] = [
  { icon: LayoutDashboard, label: 'Tableau de bord', page: 'dashboard' },
  { icon: Users, label: 'Fidèles', page: 'dashboard-members' },
  { icon: Calendar, label: 'Activités', page: 'dashboard-activities' },
  { icon: CalendarCheck, label: 'Rendez-vous', page: 'dashboard-appointments' },
  { icon: UsersRound, label: 'Groupes', page: 'dashboard-groups' },
  { icon: Wallet, label: 'Finances', page: 'dashboard-finances' },
  { icon: FileText, label: 'Certificats', page: 'dashboard-certificates' },
  { icon: Cross, label: 'Cimetière', page: 'dashboard-cemetery', premium: true },
  { icon: Megaphone, label: 'Communication', page: 'dashboard-communication' },
  { icon: Settings, label: 'Paramètres', page: 'dashboard-settings' },
]

// ─── Breadcrumb mapping ────────────────────────────────────────────────

const breadcrumbMap: Record<string, { parent?: string; label: string }> = {
  dashboard: { label: 'Tableau de bord' },
  'dashboard-members': { parent: 'dashboard', label: 'Fidèles' },
  'dashboard-activities': { parent: 'dashboard', label: 'Activités' },
  'dashboard-appointments': { parent: 'dashboard', label: 'Rendez-vous' },
  'dashboard-groups': { parent: 'dashboard', label: 'Groupes' },
  'dashboard-finances': { parent: 'dashboard', label: 'Finances' },
  'dashboard-certificates': { parent: 'dashboard', label: 'Certificats' },
  'dashboard-cemetery': { parent: 'dashboard', label: 'Cimetière' },
  'dashboard-communication': { parent: 'dashboard', label: 'Communication' },
  'dashboard-settings': { parent: 'dashboard', label: 'Paramètres' },
  'dashboard-billing': { parent: 'dashboard-settings', label: 'Facturation' },
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD LAYOUT COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export function DashboardLayout() {
  const {
    currentPage,
    setPage,
    sidebarOpen,
    setSidebarOpen,
    user,
    church,
    logout,
    notificationCount,
  } = useAppStore()

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const userInitials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : 'U'

  const userDisplayName = user
    ? `${user.firstName} ${user.lastName}`
    : 'Utilisateur'

  const churchPlan = (church?.plan || 'GRATUIT').replace('_', ' ')
  const isPremium = church?.plan === 'PREMIUM' || church?.plan === 'DIOCESE'

  // ─── Render current page ─────────────────────────────────────────
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardMainPage />
      case 'dashboard-members':
        return <MembersPage />
      case 'dashboard-activities':
        return <ActivitiesPage />
      case 'dashboard-appointments':
        return <AppointmentsPage />
      case 'dashboard-groups':
        return <GroupsPage />
      case 'dashboard-finances':
        return <FinancesPage />
      case 'dashboard-certificates':
        return <CertificatesPage />
      case 'dashboard-cemetery':
        return <CemeteryPage />
      case 'dashboard-communication':
        return <CommunicationPage />
      case 'dashboard-settings':
        return <SettingsPage />
      case 'dashboard-billing':
        return <BillingPage />
      default:
        return <DashboardMainPage />
    }
  }

  // ─── Build breadcrumb ────────────────────────────────────────────
  const buildBreadcrumb = () => {
    const current = breadcrumbMap[currentPage]
    if (!current) return null

    const items = []
    if (current.parent && breadcrumbMap[current.parent]) {
      items.push({
        label: breadcrumbMap[current.parent].label,
        page: current.parent,
      })
    }
    items.push({ label: current.label, page: currentPage })

    return (
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, idx) => (
            <React.Fragment key={item.page}>
              {idx > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {idx === items.length - 1 ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setPage(item.page as AppPage)
                    }}
                  >
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* ─── SIDEBAR ─────────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        <motion.aside
          initial={false}
          animate={{ width: sidebarOpen ? 280 : 70 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="relative flex flex-col border-r border-white/10 bg-[#1B3A5C] text-white shrink-0 overflow-hidden z-30"
        >
          {/* Logo area */}
          <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10 shrink-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/15 shrink-0">
              <Church className="size-5 text-white" />
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="font-serif text-lg font-bold whitespace-nowrap"
                >
                  My Church
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-3">
            <nav className="space-y-1 px-2">
              {navItems.map((item) => {
                const isActive = currentPage === item.page
                const Icon = item.icon

                const navButton = (
                  <button
                    key={item.page}
                    onClick={() => setPage(item.page)}
                    className={`
                      w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                      transition-all duration-200 group
                      ${isActive
                        ? 'bg-white/15 text-white shadow-sm'
                        : 'text-white/60 hover:bg-white/8 hover:text-white'
                      }
                    `}
                  >
                    <Icon className={`size-5 shrink-0 ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`} />
                    <AnimatePresence>
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="truncate whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {sidebarOpen && item.premium && (
                      <Badge className="ml-auto text-[10px] px-1.5 py-0 bg-[#C9A84C] text-[#1B3A5C] border-0 font-bold">
                        PRO
                      </Badge>
                    )}
                  </button>
                )

                // Show tooltip when sidebar is collapsed
                if (!sidebarOpen) {
                  return (
                    <TooltipProvider key={item.page} delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>{navButton}</TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                          {item.label}
                          {item.premium && ' (Premium)'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                }

                return navButton
              })}
            </nav>
          </ScrollArea>

          {/* Bottom section: church info + user */}
          <div className="border-t border-white/10 p-3 space-y-2 shrink-0">
            {/* Church info */}
            {sidebarOpen && church && (
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#C9A84C] text-[#1B3A5C] shrink-0">
                  <Church className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{church.name}</p>
                  <p className="text-[10px] text-white/40 truncate">{church.city}, {church.country}</p>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-4 px-1 border-0 ${
                      isPremium
                        ? 'bg-[#C9A84C]/20 text-[#C9A84C]'
                        : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {churchPlan}
                  </Badge>
                </div>
              </div>
            )}

            {/* User info + logout */}
            <div className="flex items-center gap-2 px-2 py-1.5">
              <Avatar className="size-8 shrink-0 border-2 border-white/20">
                <AvatarFallback className="bg-white/15 text-white text-xs font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              {sidebarOpen && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{userDisplayName}</p>
                  <p className="text-[10px] text-white/50 truncate">
                    {user?.role === 'ADMIN_PAROISSE' ? 'Administrateur' : 
                     user?.role === 'ABBE' ? 'Abbé' : 
                     user?.role === 'DIRIGEANT_GROUPE' ? 'Dir. de groupe' : 
                     user?.role === 'PAROISSIEN' ? 'Paroissien' : user?.role || ''}
                  </p>
                </div>
              )}
              {sidebarOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-white/50 hover:text-white hover:bg-white/10 shrink-0"
                  onClick={logout}
                  aria-label="Se déconnecter"
                >
                  <LogOut className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* ─── MAIN CONTENT AREA ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center gap-4 h-16 px-4 sm:px-6">
            {/* Left: Hamburger + Breadcrumb */}
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={sidebarOpen ? 'Réduire le menu' : 'Ouvrir le menu'}
              >
                <Menu className="size-5" />
              </Button>
              <div className="hidden sm:block min-w-0">
                {buildBreadcrumb()}
              </div>
              <h2 className="text-sm font-semibold sm:hidden truncate">
                {breadcrumbMap[currentPage]?.label || 'Dashboard'}
              </h2>
            </div>

            {/* Center: Search bar */}
            <div className="flex-1 max-w-md mx-auto hidden md:block">
              <div
                className="relative cursor-pointer"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  readOnly
                  placeholder="Rechercher... (⌘K)"
                  className="pl-9 bg-muted/50 cursor-pointer h-9"
                  onClick={() => setSearchOpen(true)}
                />
              </div>
            </div>

            {/* Right: Notifications + User dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Notification bell */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => toast.info('Notifications à venir')}
                aria-label="Notifications"
              >
                <Bell className="size-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center size-4 rounded-full bg-destructive text-white text-[10px] font-bold">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </Button>

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2 h-9">
                    <Avatar className="size-7">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">
                      {userDisplayName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => toast.info('Profil à venir')}>
                    <User className="size-4 mr-2" />
                    Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPage('dashboard-settings')}>
                    <Settings className="size-4 mr-2" />
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPage('dashboard-billing')}>
                    <CreditCard className="size-4 mr-2" />
                    Facturation
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                    <LogOut className="size-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          {renderPage()}
        </main>
      </div>

      {/* ─── SEARCH OVERLAY (decorative) ──────────────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[20vh]"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="shadow-2xl">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                    <Search className="size-5 text-muted-foreground shrink-0" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher des fidèles, activités, certificats..."
                      className="border-0 shadow-none focus-visible:ring-0 px-0"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0"
                      onClick={() => setSearchOpen(false)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <p>Tapez pour rechercher...</p>
                    <p className="text-xs mt-1">Fonctionnalité bientôt disponible</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
