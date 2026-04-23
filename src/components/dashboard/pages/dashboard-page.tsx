'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Calendar,
  CalendarCheck,
  Wallet,
  Clock,
  MapPin,
  FileText,
  UserPlus,
  Bell,
  ArrowRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore, type AppPage } from '@/lib/store'

// Types for the stats API response
interface MonthlyDonation {
  month: string
  amount: number
}

interface RecentMember {
  id: string
  firstName: string
  lastName: string
  email: string
  avatarUrl: string | null
  createdAt: string
  isActive: boolean
}

interface UpcomingActivity {
  id: string
  title: string
  type: string
  startDateTime: string
  endDateTime: string
  location: string | null
}

interface DashboardStats {
  totalMembers: number
  activeMembers: number
  todayAppointments: number
  weekActivities: number
  totalDonations: number
  donationsByMethod: Record<string, number>
  monthlyDonations: MonthlyDonation[]
  pendingCertificates: number
  pendingAppointments: number
  groups: number
  recentMembers: RecentMember[]
  upcomingActivities: UpcomingActivity[]
}

// Activity type config: icon color + label
const activityTypeConfig: Record<string, { color: string; bg: string; label: string }> = {
  MESSE: { color: 'text-blue-700', bg: 'bg-blue-100', label: 'Messe' },
  ADORATION: { color: 'text-amber-700', bg: 'bg-amber-100', label: 'Adoration' },
  CONFESSION: { color: 'text-purple-700', bg: 'bg-purple-100', label: 'Confession' },
  CATECHESE: { color: 'text-green-700', bg: 'bg-green-100', label: 'Catéchèse' },
  REUNION: { color: 'text-slate-700', bg: 'bg-slate-100', label: 'Réunion' },
  EVENT_SPECIAL: { color: 'text-rose-700', bg: 'bg-rose-100', label: 'Événement' },
  AUTRE: { color: 'text-gray-700', bg: 'bg-gray-100', label: 'Autre' },
}

// Donation method config
const donationMethodConfig: Record<string, { label: string; color: string }> = {
  ORANGE_MONEY: { label: 'Orange Money', color: 'bg-orange-500' },
  M_PESA: { label: 'M-Pesa', color: 'bg-green-500' },
  STRIPE: { label: 'Stripe', color: 'bg-indigo-500' },
  CASH: { label: 'Espèces', color: 'bg-amber-500' },
}

function formatXOF(amount: number): string {
  return amount.toLocaleString('fr-FR') + ' XOF'
}

// Custom tooltip for the area chart
function DonationTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-white px-3 py-2 shadow-md">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-sm font-bold text-primary">
          {formatXOF(payload[0].value)}
        </p>
      </div>
    )
  }
  return null
}

// Skeleton loader for the stats cards
function StatsCardSkeleton() {
  return (
    <Card className="rounded-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}

// Skeleton loader for chart sections
function ChartSkeleton() {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[250px] w-full rounded-md" />
      </CardContent>
    </Card>
  )
}

// Skeleton loader for list sections
function ListSkeleton() {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { churchId, setPage } = useAppStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!churchId) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchStats() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/stats?churchId=${churchId}`)
        if (!res.ok) {
          throw new Error('Erreur lors du chargement des statistiques')
        }
        const data = await res.json()
        if (!cancelled) {
          setStats(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erreur inconnue')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchStats()
    return () => {
      cancelled = true
    }
  }, [churchId])

  // ========== ROW 1: Stats Cards ==========
  const statsCards = stats
    ? [
        {
          title: 'Fidèles Actifs',
          value: stats.totalMembers.toString(),
          change: '+12% ce mois',
          positive: true,
          icon: Users,
          iconBg: 'bg-primary/10',
          iconColor: 'text-primary',
        },
        {
          title: 'Activités cette semaine',
          value: stats.weekActivities.toString(),
          change: '+3 cette semaine',
          positive: true,
          icon: Calendar,
          iconBg: 'bg-emerald-100',
          iconColor: 'text-emerald-600',
        },
        {
          title: "RDV aujourd'hui",
          value: stats.todayAppointments.toString(),
          change: `${stats.pendingAppointments} en attente`,
          positive: stats.pendingAppointments === 0,
          icon: CalendarCheck,
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
        },
        {
          title: 'Dons ce mois',
          value: formatXOF(stats.totalDonations),
          change: '+18% vs mois dernier',
          positive: true,
          icon: Wallet,
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600',
        },
      ]
    : []

  // ========== ROW 2: Donation methods breakdown ==========
  const donationMethods = stats
    ? Object.entries(stats.donationsByMethod).map(([method, amount]) => {
        const config = donationMethodConfig[method] || {
          label: method,
          color: 'bg-gray-500',
        }
        const pct =
          stats.totalDonations > 0
            ? Math.round((amount / stats.totalDonations) * 100)
            : 0
        return { method, amount, pct, ...config }
      })
    : []

  // ========== RENDER: Loading state ==========
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
        {/* Chart skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ChartSkeleton />
          </div>
          <div>
            <ChartSkeleton />
          </div>
        </div>
        {/* Lists skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ListSkeleton />
          </div>
          <div>
            <ListSkeleton />
          </div>
        </div>
      </div>
    )
  }

  // ========== RENDER: Error state ==========
  if (error) {
    return (
      <Card className="rounded-lg border-destructive/50">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-4 rounded-full bg-destructive/10 p-3">
            <Bell className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="mb-1 font-semibold text-lg">
            Erreur de chargement
          </h3>
          <p className="text-muted-foreground text-sm">{error}</p>
        </CardContent>
      </Card>
    )
  }

  // ========== RENDER: No church ==========
  if (!stats) {
    return (
      <Card className="rounded-lg">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-3">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-1 font-semibold text-lg">
            Aucune paroisse sélectionnée
          </h3>
          <p className="text-muted-foreground text-sm">
            Veuillez sélectionner une paroisse pour voir les statistiques.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* ===== ROW 1: Stats Cards ===== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => {
          const IconComp = card.icon
          return (
            <Card
              key={card.title}
              className="rounded-lg transition-shadow hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold tracking-tight">
                      {card.value}
                    </p>
                    <div className="flex items-center gap-1">
                      {card.positive ? (
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                      )}
                      <span
                        className={`text-xs font-medium ${
                          card.positive ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {card.change}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${card.iconBg}`}
                  >
                    <IconComp className={`h-6 w-6 ${card.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ===== ROW 2: Charts ===== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Monthly Donations Chart */}
        <div className="lg:col-span-2">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle className="text-base">Dons mensuels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={stats.monthlyDonations}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient
                        id="donationGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="oklch(0.32 0.08 250)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="oklch(0.32 0.08 250)"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.91 0.015 80)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: 'oklch(0.45 0.02 260)' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: 'oklch(0.45 0.02 260)' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value: number) =>
                        value >= 1000
                          ? `${(value / 1000).toFixed(0)}k`
                          : value.toString()
                      }
                    />
                    <Tooltip content={<DonationTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="oklch(0.32 0.08 250)"
                      strokeWidth={2.5}
                      fill="url(#donationGradient)"
                      dot={{
                        r: 4,
                        fill: 'oklch(0.32 0.08 250)',
                        stroke: '#fff',
                        strokeWidth: 2,
                      }}
                      activeDot={{
                        r: 6,
                        fill: 'oklch(0.32 0.08 250)',
                        stroke: '#fff',
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Donation Methods Breakdown */}
        <div>
          <Card className="rounded-lg h-full">
            <CardHeader>
              <CardTitle className="text-base">
                Répartition par méthode
              </CardTitle>
            </CardHeader>
            <CardContent>
              {donationMethods.length === 0 ? (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                  Aucun don ce mois
                </div>
              ) : (
                <div className="space-y-5">
                  {donationMethods.map((dm) => (
                    <div key={dm.method} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {dm.label}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatXOF(dm.amount)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 flex-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${dm.color} transition-all duration-500`}
                            style={{ width: `${dm.pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground w-10 text-right">
                          {dm.pct}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ===== ROW 3: Activities & Members ===== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Upcoming Activities */}
        <div className="lg:col-span-2">
          <Card className="rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Activités à venir</CardTitle>
              <button className="flex items-center gap-1 text-sm font-medium text-primary hover:underline" onClick={() => setPage('dashboard-activities')}>
                Voir tout
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </CardHeader>
            <CardContent>
              {stats.upcomingActivities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-sm">
                  <Calendar className="mb-2 h-8 w-8 opacity-40" />
                  Aucune activité à venir
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                  {stats.upcomingActivities.map((activity) => {
                    const typeConfig =
                      activityTypeConfig[activity.type] ||
                      activityTypeConfig.AUTRE
                    const startDate = parseISO(activity.startDateTime)
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${typeConfig.bg}`}
                        >
                          <Clock
                            className={`h-5 w-5 ${typeConfig.color}`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-medium text-sm">
                              {activity.title}
                            </p>
                            <Badge
                              variant="secondary"
                              className={`text-[10px] px-1.5 py-0 ${typeConfig.bg} ${typeConfig.color} border-0`}
                            >
                              {typeConfig.label}
                            </Badge>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(startDate, 'dd MMM yyyy', {
                                locale: fr,
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(startDate, 'HH:mm', { locale: fr })}
                            </span>
                            {activity.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {activity.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Recent Members */}
        <div>
          <Card className="rounded-lg h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Nouveaux fidèles</CardTitle>
              <button className="flex items-center gap-1 text-sm font-medium text-primary hover:underline" onClick={() => setPage('dashboard-members')}>
                Voir tout
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </CardHeader>
            <CardContent>
              {stats.recentMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-sm">
                  <UserPlus className="mb-2 h-8 w-8 opacity-40" />
                  Aucun nouveau fidèle
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                  {stats.recentMembers.map((member) => {
                    const initials =
                      (member.firstName?.[0] || '') +
                      (member.lastName?.[0] || '')
                    const joinDate = parseISO(member.createdAt)
                    return (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {initials.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {member.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(joinDate, 'dd MMM yyyy', { locale: fr })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ===== ROW 4: Pending Items ===== */}
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="text-base">En attente de traitement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Pending Appointments */}
            <button className="flex items-center gap-4 rounded-lg border bg-amber-50/50 p-4 text-left transition-colors hover:bg-amber-50 dark:bg-amber-950/20 dark:hover:bg-amber-950/30" onClick={() => setPage('dashboard-appointments')}>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
                <CalendarCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.pendingAppointments}
                </p>
                <p className="text-sm text-muted-foreground">RDV en attente</p>
              </div>
            </button>

            {/* Pending Certificates */}
            <button className="flex items-center gap-4 rounded-lg border bg-blue-50/50 p-4 text-left transition-colors hover:bg-blue-50 dark:bg-blue-950/20 dark:hover:bg-blue-950/30" onClick={() => setPage('dashboard-certificates')}>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.pendingCertificates}
                </p>
                <p className="text-sm text-muted-foreground">
                  Certificats demandés
                </p>
              </div>
            </button>

            {/* Group Invitations (decorative) */}
            <button className="flex items-center gap-4 rounded-lg border bg-purple-50/50 p-4 text-left transition-colors hover:bg-purple-50 dark:bg-purple-950/20 dark:hover:bg-purple-950/30" onClick={() => setPage('dashboard-groups')}>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/40">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.groups}</p>
                <p className="text-sm text-muted-foreground">
                  Groupes actifs
                </p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: oklch(0.8 0.01 80);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: oklch(0.65 0.02 80);
        }
      `}</style>
    </div>
  )
}
