'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Calendar as CalendarIcon,
  List,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Users,
  Eye,
  Church,
  Heart,
  BookOpen,
  MessageSquare,
  PartyPopper,
  X,
} from 'lucide-react'

interface Activity {
  id: string
  churchId: string
  createdById: string
  title: string
  description: string | null
  type: string
  startDateTime: string
  endDateTime: string
  location: string | null
  isRecurring: boolean
  maxParticipants: number | null
  currentParticipants: number
  visibility: string
  groupId: string | null
  celebrandId: string | null
  createdBy: {
    id: string
    firstName: string
    lastName: string
  } | null
  celebrand: {
    id: string
    firstName: string
    lastName: string
  } | null
  group: {
    id: string
    name: string
  } | null
}

interface ActivitiesResponse {
  activities: Activity[]
}

interface AbbeUser {
  id: string
  firstName: string
  lastName: string
}

const ACTIVITY_TYPE_COLORS: Record<string, string> = {
  MESSE: 'bg-blue-500',
  ADORATION: 'bg-amber-500',
  CONFESSION: 'bg-purple-500',
  CATECHESE: 'bg-emerald-500',
  REUNION: 'bg-orange-500',
  EVENT_SPECIAL: 'bg-red-500',
  AUTRE: 'bg-gray-500',
}

const ACTIVITY_TYPE_DOT_COLORS: Record<string, string> = {
  MESSE: 'bg-blue-500',
  ADORATION: 'bg-amber-500',
  CONFESSION: 'bg-purple-500',
  CATECHESE: 'bg-emerald-500',
  REUNION: 'bg-orange-500',
  EVENT_SPECIAL: 'bg-red-500',
  AUTRE: 'bg-gray-500',
}

const ACTIVITY_TYPE_TEXT_COLORS: Record<string, string> = {
  MESSE: 'text-blue-700 bg-blue-50 border-blue-200',
  ADORATION: 'text-amber-700 bg-amber-50 border-amber-200',
  CONFESSION: 'text-purple-700 bg-purple-50 border-purple-200',
  CATECHESE: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  REUNION: 'text-orange-700 bg-orange-50 border-orange-200',
  EVENT_SPECIAL: 'text-red-700 bg-red-50 border-red-200',
  AUTRE: 'text-gray-700 bg-gray-50 border-gray-200',
}

const ACTIVITY_TYPE_ICONS: Record<string, React.ReactNode> = {
  MESSE: <Church className="h-4 w-4" />,
  ADORATION: <Heart className="h-4 w-4" />,
  CONFESSION: <MessageSquare className="h-4 w-4" />,
  CATECHESE: <BookOpen className="h-4 w-4" />,
  REUNION: <Users className="h-4 w-4" />,
  EVENT_SPECIAL: <PartyPopper className="h-4 w-4" />,
  AUTRE: <CalendarIcon className="h-4 w-4" />,
}

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  MESSE: 'Messe',
  ADORATION: 'Adoration',
  CONFESSION: 'Confession',
  CATECHESE: 'Catéchèse',
  REUNION: 'Réunion',
  EVENT_SPECIAL: 'Événement spécial',
  AUTRE: 'Autre',
}

const VISIBILITY_LABELS: Record<string, string> = {
  PUBLIC: 'Public',
  MEMBERS_ONLY: 'Membres uniquement',
  GROUP_ONLY: 'Groupe uniquement',
}

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function formatDate(dateStr: string): Date {
  return new Date(dateStr)
}

function formatTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

function formatFullDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay()
  // Convert Sunday=0 to Monday-first: 0(Sun)->6, 1(Mon)->0, 2(Tue)->1, etc.
  return day === 0 ? 6 : day - 1
}

export default function ActivitiesPage() {
  const { churchId, userId } = useAppStore()
  const [activities, setActivities] = useState<Activity[]>([])
  const [abbes, setAbbes] = useState<AbbeUser[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [visibilityFilter, setVisibilityFilter] = useState<string>('')

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [form, setForm] = useState({
    title: '',
    type: 'MESSE',
    description: '',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '11:00',
    location: '',
    visibility: 'PUBLIC' as string,
    maxParticipants: '',
    celebrandId: '',
  })

  const fetchActivities = useCallback(async () => {
    if (!churchId) return
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (typeFilter) params.type = typeFilter
      if (visibilityFilter) params.visibility = visibilityFilter

      const data = await api.getActivities(churchId, params)
      const response = data as unknown as ActivitiesResponse
      setActivities(response.activities || [])
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }, [churchId, typeFilter, visibilityFilter])

  const fetchAbbes = useCallback(async () => {
    if (!churchId) return
    try {
      const res = await fetch(`/api/churches/${churchId}/members?limit=100&status=active`)
      if (res.ok) {
        const data = await res.json()
        const abbeList = (data.members || []).filter(
          (m: { role: string }) => m.role === 'ABBE'
        )
        setAbbes(abbeList)
      }
    } catch (error) {
      console.error('Error fetching abbés:', error)
    }
  }, [churchId])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  useEffect(() => {
    fetchAbbes()
  }, [fetchAbbes])

  const handleCreateActivity = async () => {
    if (!churchId) return
    setSubmitting(true)
    try {
      const startDateTime = form.startDate && form.startTime
        ? new Date(`${form.startDate}T${form.startTime}:00`).toISOString()
        : new Date().toISOString()
      const endDateTime = form.endDate && form.endTime
        ? new Date(`${form.endDate}T${form.endTime}:00`).toISOString()
        : new Date(new Date(startDateTime).getTime() + 2 * 60 * 60 * 1000).toISOString()

      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          churchId,
          createdById: userId || churchId,
          title: form.title,
          description: form.description || null,
          type: form.type,
          startDateTime,
          endDateTime,
          location: form.location || null,
          visibility: form.visibility,
          celebrandId: form.celebrandId || null,
          maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : null,
        }),
      })
      setCreateDialogOpen(false)
      resetForm()
      fetchActivities()
    } catch (error) {
      console.error('Error creating activity:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setForm({
      title: '',
      type: 'MESSE',
      description: '',
      startDate: '',
      startTime: '09:00',
      endDate: '',
      endTime: '11:00',
      location: '',
      visibility: 'PUBLIC',
      maxParticipants: '',
      celebrandId: '',
    })
  }

  // Calendar helpers
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
  const today = new Date()

  const getActivitiesForDay = (day: number): Activity[] => {
    return activities.filter((a) => {
      const date = formatDate(a.startDateTime)
      return (
        date.getFullYear() === currentYear &&
        date.getMonth() === currentMonth &&
        date.getDate() === day
      )
    })
  }

  const selectedDayActivities = selectedDay ? getActivitiesForDay(selectedDay) : []

  const navigateMonth = (delta: number) => {
    setSelectedDay(null)
    setCurrentDate(new Date(currentYear, currentMonth + delta, 1))
  }

  // Weekly view helpers
  const getWeekDays = (): Date[] => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = day === 0 ? 6 : day - 1
    startOfWeek.setDate(startOfWeek.getDate() - diff)

    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek)
      d.setDate(startOfWeek.getDate() + i)
      days.push(d)
    }
    return days
  }

  const getActivitiesForDate = (date: Date): Activity[] => {
    return activities.filter((a) => {
      const actDate = formatDate(a.startDateTime)
      return (
        actDate.getFullYear() === date.getFullYear() &&
        actDate.getMonth() === date.getMonth() &&
        actDate.getDate() === date.getDate()
      )
    })
  }

  const navigateWeek = (delta: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + delta * 7)
    setCurrentDate(newDate)
  }

  const weekDays = getWeekDays()

  // Filter activities for list view
  const filteredActivities = activities.filter((a) => {
    if (typeFilter && a.type !== typeFilter) return false
    if (visibilityFilter && a.visibility !== visibilityFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" />
            Calendrier des Activités
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {activities.length} activité{activities.length !== 1 ? 's' : ''} planifiée{activities.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => { resetForm(); setCreateDialogOpen(true) }} className="gap-2">
          <Plus className="h-4 w-4" />
          Créer une activité
        </Button>
      </div>

      {/* View Tabs */}
      <Tabs defaultValue="monthly" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="monthly" className="gap-1">
              <CalendarIcon className="h-3.5 w-3.5" />
              Mensuel
            </TabsTrigger>
            <TabsTrigger value="weekly" className="gap-1">
              <List className="h-3.5 w-3.5" />
              Hebdomadaire
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-1">
              <Eye className="h-3.5 w-3.5" />
              Liste
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {Object.entries(ACTIVITY_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={visibilityFilter} onValueChange={(v) => setVisibilityFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Visibilité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {Object.entries(VISIBILITY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Monthly View */}
        <TabsContent value="monthly">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Calendar Grid */}
            <div className="flex-1 rounded-lg border bg-card">
              {/* Month Navigation */}
              <div className="flex items-center justify-between p-4 border-b">
                <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {loading ? (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-2">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <Skeleton key={j} className="h-16 flex-1" />
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-2">
                  {/* Day headers */}
                  <div className="grid grid-cols-7 mb-1">
                    {DAYS_OF_WEEK.map((day) => (
                      <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  {/* Day cells */}
                  <div className="grid grid-cols-7 gap-px">
                    {/* Empty cells before first day */}
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-20 sm:h-24 p-1 bg-muted/30" />
                    ))}
                    {/* Day cells */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1
                      const dayActivities = getActivitiesForDay(day)
                      const isToday =
                        today.getFullYear() === currentYear &&
                        today.getMonth() === currentMonth &&
                        today.getDate() === day
                      const isSelected = selectedDay === day

                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                          className={`h-20 sm:h-24 p-1 text-left border border-transparent hover:border-primary/30 rounded-sm transition-colors relative ${
                            isSelected ? 'bg-primary/5 border-primary/30' : 'hover:bg-accent/50'
                          }`}
                        >
                          <span
                            className={`text-xs font-medium inline-flex items-center justify-center h-6 w-6 rounded-full ${
                              isToday
                                ? 'bg-primary text-primary-foreground'
                                : 'text-foreground'
                            }`}
                          >
                            {day}
                          </span>
                          <div className="mt-0.5 space-y-0.5 overflow-hidden">
                            {dayActivities.slice(0, 3).map((activity) => (
                              <div
                                key={activity.id}
                                className={`text-[10px] leading-tight px-1 py-0.5 rounded text-white truncate ${
                                  ACTIVITY_TYPE_DOT_COLORS[activity.type] || 'bg-gray-500'
                                }`}
                              >
                                {activity.title}
                              </div>
                            ))}
                            {dayActivities.length > 3 && (
                              <div className="text-[10px] text-muted-foreground px-1">
                                +{dayActivities.length - 3} autres
                              </div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Selected Day Panel */}
            {selectedDay && (
              <div className="w-full lg:w-80 rounded-lg border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">
                    {DAYS_OF_WEEK[new Date(currentYear, currentMonth, selectedDay).getDay() === 0 ? 6 : new Date(currentYear, currentMonth, selectedDay).getDay() - 1]} {selectedDay} {MONTH_NAMES[currentMonth]}
                  </h3>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedDay(null)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                {selectedDayActivities.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Aucune activité ce jour
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {selectedDayActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="rounded-lg border p-3 space-y-2"
                      >
                        <div className="flex items-start gap-2">
                          <div className={`mt-0.5 ${ACTIVITY_TYPE_COLORS[activity.type] || 'bg-gray-500'} rounded p-1 text-white`}>
                            {ACTIVITY_TYPE_ICONS[activity.type]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {ACTIVITY_TYPE_LABELS[activity.type] || activity.type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTime(activity.startDateTime)} - {formatTime(activity.endDateTime)}
                        </div>
                        {activity.location && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {activity.location}
                          </div>
                        )}
                        {activity.celebrand && (
                          <p className="text-xs text-muted-foreground">
                            Célébrant: {activity.celebrand.firstName} {activity.celebrand.lastName}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Weekly View */}
        <TabsContent value="weekly">
          <div className="rounded-lg border bg-card">
            <div className="flex items-center justify-between p-4 border-b">
              <Button variant="ghost" size="icon" onClick={() => navigateWeek(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold">
                Semaine du {weekDays[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} - {weekDays[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => navigateWeek(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {loading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : (
              <div className="divide-y">
                {weekDays.map((date) => {
                  const dayActivities = getActivitiesForDate(date)
                  const isToday =
                    today.getFullYear() === date.getFullYear() &&
                    today.getMonth() === date.getMonth() &&
                    today.getDate() === date.getDate()

                  return (
                    <div key={date.toISOString()} className="flex gap-4 p-4">
                      <div className="w-16 text-center shrink-0">
                        <p className="text-xs text-muted-foreground uppercase">
                          {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                        </p>
                        <p className={`text-2xl font-bold ${isToday ? 'text-primary' : ''}`}>
                          {date.getDate()}
                        </p>
                      </div>
                      <div className="flex-1 space-y-2">
                        {dayActivities.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-2">Aucune activité</p>
                        ) : (
                          dayActivities.map((activity) => (
                            <div
                              key={activity.id}
                              className="flex items-center gap-3 rounded-lg border p-3"
                            >
                              <div className={`shrink-0 ${ACTIVITY_TYPE_COLORS[activity.type] || 'bg-gray-500'} rounded p-1.5 text-white`}>
                                {ACTIVITY_TYPE_ICONS[activity.type]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{activity.title}</p>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(activity.startDateTime)} - {formatTime(activity.endDateTime)}
                                  </span>
                                  {activity.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {activity.location}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Badge className={`text-xs ${ACTIVITY_TYPE_TEXT_COLORS[activity.type] || ''}`} variant="outline">
                                {ACTIVITY_TYPE_LABELS[activity.type] || activity.type}
                              </Badge>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="rounded-lg border bg-card p-12 text-center">
              <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">Aucune activité trouvée</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {typeFilter || visibilityFilter
                  ? 'Essayez de modifier vos filtres'
                  : 'Commencez par créer votre première activité'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-lg border bg-card p-4 flex flex-col sm:flex-row gap-4"
                >
                  {/* Type Icon */}
                  <div className={`shrink-0 self-start ${ACTIVITY_TYPE_COLORS[activity.type] || 'bg-gray-500'} rounded-lg p-3 text-white`}>
                    {ACTIVITY_TYPE_ICONS[activity.type]}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm">{activity.title}</h3>
                        {activity.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {activity.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge className={`text-xs ${ACTIVITY_TYPE_TEXT_COLORS[activity.type] || ''}`} variant="outline">
                          {ACTIVITY_TYPE_LABELS[activity.type] || activity.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {VISIBILITY_LABELS[activity.visibility] || activity.visibility}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {formatFullDate(activity.startDateTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(activity.startDateTime)} - {formatTime(activity.endDateTime)}
                      </span>
                      {activity.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {activity.location}
                        </span>
                      )}
                      {activity.celebrand && (
                        <span>
                          Célébrant: {activity.celebrand.firstName} {activity.celebrand.lastName}
                        </span>
                      )}
                      {activity.maxParticipants && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {activity.currentParticipants}/{activity.maxParticipants}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Activity Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer une activité</DialogTitle>
            <DialogDescription>
              Planifiez une nouvelle activité paroissiale.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-title">Titre *</Label>
              <Input
                id="create-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Titre de l'activité"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-type">Type *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ACTIVITY_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-visibility">Visibilité</Label>
                <Select value={form.visibility} onValueChange={(v) => setForm({ ...form, visibility: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(VISIBILITY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-description">Description</Label>
              <Textarea
                id="create-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Description de l'activité"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-startDate">Date début *</Label>
                <Input
                  id="create-startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => {
                    const changes: Partial<typeof form> = { startDate: e.target.value }
                    if (!form.endDate) changes.endDate = e.target.value
                    setForm({ ...form, ...changes })
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-startTime">Heure début *</Label>
                <Input
                  id="create-startTime"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-endDate">Date fin</Label>
                <Input
                  id="create-endDate"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-endTime">Heure fin</Label>
                <Input
                  id="create-endTime"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-location">Lieu</Label>
              <Input
                id="create-location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Lieu de l'activité"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-celebrand">Célébrant</Label>
                <Select value={form.celebrandId} onValueChange={(v) => setForm({ ...form, celebrandId: v === 'none' ? '' : v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    {abbes.map((abbe) => (
                      <SelectItem key={abbe.id} value={abbe.id}>
                        P. {abbe.firstName} {abbe.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-maxParticipants">Max participants</Label>
                <Input
                  id="create-maxParticipants"
                  type="number"
                  value={form.maxParticipants}
                  onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })}
                  placeholder="Illimité"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleCreateActivity}
              disabled={submitting || !form.title || !form.startDate}
            >
              {submitting ? 'Création...' : 'Créer l\'activité'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
