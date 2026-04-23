'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  CalendarCheck,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Types ──────────────────────────────────────────────────────────────

interface AbbeUser {
  id: string
  firstName: string
  lastName: string
  avatarUrl: string | null
  phone: string
}

interface FideleUser {
  id: string
  firstName: string
  lastName: string
  phone: string | null
  avatarUrl: string | null
}

interface AppointmentData {
  id: string
  userId: string
  abbeId: string
  churchId: string
  date: string
  startTime: string
  endTime: string
  motif: string
  notes: string | null
  notesFidele: string | null
  status: string
  canceledBy: string | null
  canceledReason: string | null
  createdAt: string
  user: FideleUser
  abbe: {
    id: string
    firstName: string
    lastName: string
    avatarUrl: string | null
  }
}

// ─── Constants ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  EN_ATTENTE: { label: 'En attente', color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200' },
  CONFIRME: { label: 'Confirmé', color: 'text-emerald-700', bgColor: 'bg-emerald-50 border-emerald-200' },
  REFUSE: { label: 'Refusé', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200' },
  ANNULE: { label: 'Annulé', color: 'text-gray-700', bgColor: 'bg-gray-50 border-gray-200' },
  TERMINE: { label: 'Terminé', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200' },
  REPROGRAMME: { label: 'Reprogrammé', color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200' },
}

const SLOT_COLORS: Record<string, string> = {
  EN_ATTENTE: 'bg-amber-100 border-amber-300',
  CONFIRME: 'bg-emerald-100 border-emerald-300',
  REFUSE: 'bg-red-100 border-red-300',
  ANNULE: 'bg-gray-100 border-gray-300',
  TERMINE: 'bg-blue-100 border-blue-300',
}

const MOTIF_OPTIONS = [
  { value: 'BAPTEME', label: 'Baptême' },
  { value: 'MARIAGE', label: 'Mariage' },
  { value: 'CONFESSION', label: 'Confession' },
  { value: 'DIRECTION_SPIRITUELLE', label: 'Direction spirituelle' },
  { value: 'MALADIE', label: 'Maladie' },
  { value: 'BENEDICTION', label: 'Bénédiction' },
  { value: 'AUTRE', label: 'Autre' },
]

const MOTIF_LABELS: Record<string, string> = Object.fromEntries(
  MOTIF_OPTIONS.map((m) => [m.value, m.label])
)

const TIME_SLOTS: string[] = []
for (let h = 8; h <= 18; h++) {
  TIME_SLOTS.push(`${h.toString().padStart(2, '0')}:00`)
  TIME_SLOTS.push(`${h.toString().padStart(2, '0')}:30`)
}

const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function formatDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getInitials(firstName: string, lastName: string): string {
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
}

// ─── Component ──────────────────────────────────────────────────────────

export default function AppointmentsPage() {
  const { church, user } = useAppStore()
  const churchId = church?.id

  const [abbes, setAbbes] = useState<AbbeUser[]>([])
  const [selectedAbbeId, setSelectedAbbeId] = useState<string>('')
  const [appointments, setAppointments] = useState<AppointmentData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Search for fidèles
  const [fideleSearch, setFideleSearch] = useState('')
  const [fideleResults, setFideleResults] = useState<FideleUser[]>([])
  const [searchingFidele, setSearchingFidele] = useState(false)

  // Form state
  const [form, setForm] = useState({
    userId: '',
    userName: '',
    abbeId: '',
    date: '',
    startTime: '',
    endTime: '',
    motif: 'CONFESSION',
    notes: '',
  })

  // ─── Fetch Abbés ────────────────────────────────────────────────
  const fetchAbbes = useCallback(async () => {
    if (!churchId) return
    try {
      const res = await fetch(`/api/abbes?churchId=${churchId}`)
      if (res.ok) {
        const data = await res.json()
        setAbbes(data.abbes || [])
        if (data.abbes?.length > 0 && !selectedAbbeId) {
          setSelectedAbbeId(data.abbes[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching abbés:', error)
    }
  }, [churchId, selectedAbbeId])

  // ─── Fetch Appointments ─────────────────────────────────────────
  const fetchAppointments = useCallback(async () => {
    if (!churchId) return
    setLoading(true)
    try {
      const dateStr = formatDateStr(currentDate)
      const params = new URLSearchParams({ churchId, date: dateStr })
      if (selectedAbbeId) params.set('abbeId', selectedAbbeId)

      const res = await fetch(`/api/appointments?${params}`)
      if (res.ok) {
        const data = await res.json()
        setAppointments(data.appointments || [])
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }, [churchId, currentDate, selectedAbbeId])

  // ─── Fetch Pending ──────────────────────────────────────────────
  const [pendingAppointments, setPendingAppointments] = useState<AppointmentData[]>([])

  const fetchPending = useCallback(async () => {
    if (!churchId) return
    try {
      const res = await fetch(`/api/appointments?churchId=${churchId}&status=EN_ATTENTE`)
      if (res.ok) {
        const data = await res.json()
        setPendingAppointments(data.appointments || [])
      }
    } catch (error) {
      console.error('Error fetching pending:', error)
    }
  }, [churchId])

  useEffect(() => {
    fetchAbbes()
  }, [fetchAbbes])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  useEffect(() => {
    fetchPending()
  }, [fetchPending])

  // ─── Search Fidèles ─────────────────────────────────────────────
  const searchFideles = useCallback(async (query: string) => {
    if (!churchId || query.length < 2) {
      setFideleResults([])
      return
    }
    setSearchingFidele(true)
    try {
      const res = await fetch(`/api/churches/${churchId}/members?search=${encodeURIComponent(query)}&limit=10&status=active`)
      if (res.ok) {
        const data = await res.json()
        setFideleResults(data.members || [])
      }
    } catch (error) {
      console.error('Error searching fidèles:', error)
    } finally {
      setSearchingFidele(false)
    }
  }, [churchId])

  useEffect(() => {
    const timer = setTimeout(() => searchFideles(fideleSearch), 300)
    return () => clearTimeout(timer)
  }, [fideleSearch, searchFideles])

  // ─── Date Navigation ────────────────────────────────────────────
  const navigateDay = (delta: number) => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + delta)
    setCurrentDate(d)
  }

  const goToToday = () => setCurrentDate(new Date())

  const dateStr = formatDateStr(currentDate)
  const dayName = DAYS_FR[currentDate.getDay()]
  const monthName = MONTHS_FR[currentDate.getMonth()]
  const dayNum = currentDate.getDate()

  // ─── Agenda Helpers ─────────────────────────────────────────────
  const getAppointmentForSlot = (time: string): AppointmentData | undefined => {
    return appointments.find((apt) => apt.startTime <= time && apt.endTime > time)
  }

  const getAppointmentStartSlot = (time: string): boolean => {
    return appointments.some((apt) => apt.startTime === time)
  }

  const isSlotAvailable = (time: string): boolean => {
    return !appointments.some((apt) => {
      if (apt.status === 'ANNULE' || apt.status === 'REFUSE') return false
      return apt.startTime <= time && apt.endTime > time
    })
  }

  // ─── Form Handlers ──────────────────────────────────────────────
  const resetForm = () => {
    setForm({
      userId: '',
      userName: '',
      abbeId: selectedAbbeId || (abbes[0]?.id ?? ''),
      date: dateStr,
      startTime: '',
      endTime: '',
      motif: 'CONFESSION',
      notes: '',
    })
    setFideleSearch('')
    setFideleResults([])
  }

  const openCreateDialog = (startTime?: string) => {
    resetForm()
    if (startTime) {
      const [h, m] = startTime.split(':').map(Number)
      const endH = m === 30 ? h + 1 : h
      const endM = m === 30 ? 0 : 30
      setForm((prev) => ({
        ...prev,
        startTime,
        endTime: `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`,
      }))
    }
    setCreateDialogOpen(true)
  }

  const handleCreate = async () => {
    if (!churchId || !form.userId || !form.abbeId || !form.date || !form.startTime || !form.endTime) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: form.userId,
          abbeId: form.abbeId,
          churchId,
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          motif: form.motif,
          notes: form.notes,
        }),
      })
      if (res.ok) {
        toast.success('Rendez-vous créé avec succès')
        setCreateDialogOpen(false)
        resetForm()
        fetchAppointments()
        fetchPending()
      } else {
        const data = await res.json()
        toast.error(data.message || 'Erreur lors de la création')
      }
    } catch (error) {
      console.error('Error creating appointment:', error)
      toast.error('Erreur lors de la création')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAction = async (appointmentId: string, action: string) => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        const actionLabels: Record<string, string> = {
          confirm: 'confirmé',
          reject: 'refusé',
          cancel: 'annulé',
        }
        toast.success(`Rendez-vous ${actionLabels[action] || action}`)
        fetchAppointments()
        fetchPending()
        if (detailDialogOpen) {
          setDetailDialogOpen(false)
          setSelectedAppointment(null)
        }
      } else {
        toast.error('Erreur lors de l\'action')
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast.error('Erreur lors de l\'action')
    }
  }

  const openDetail = (apt: AppointmentData) => {
    setSelectedAppointment(apt)
    setDetailDialogOpen(true)
  }

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-primary" />
            Rendez-vous
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {appointments.length} rendez-vous ce jour — {pendingAppointments.length} en attente
          </p>
        </div>
        <Button onClick={() => openCreateDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau RDV
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Section */}
        <div className="flex-1 space-y-4">
          {/* Abbé Selector */}
          {abbes.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {abbes.map((abbe) => (
                <button
                  key={abbe.id}
                  onClick={() => setSelectedAbbeId(abbe.id === selectedAbbeId ? '' : abbe.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all min-w-[80px] ${
                    abbe.id === selectedAbbeId
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-transparent bg-card hover:border-primary/30 hover:bg-accent/50'
                  }`}
                >
                  <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                    {abbe.avatarUrl ? (
                      <AvatarImage src={abbe.avatarUrl} alt={`${abbe.firstName} ${abbe.lastName}`} />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(abbe.firstName, abbe.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium text-center whitespace-nowrap">
                    P. {abbe.firstName}
                  </span>
                </button>
              ))}
              <button
                onClick={() => setSelectedAbbeId('')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all min-w-[80px] ${
                  !selectedAbbeId
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-transparent bg-card hover:border-primary/30 hover:bg-accent/50'
                }`}
              >
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center border-2 border-white shadow-sm">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="text-xs font-medium text-center whitespace-nowrap">Tous</span>
              </button>
            </div>
          )}

          {/* Date Navigation */}
          <Card>
            <div className="flex items-center justify-between p-4 border-b">
              <Button variant="ghost" size="icon" onClick={() => navigateDay(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">
                  {dayName} {dayNum} {monthName} {currentDate.getFullYear()}
                </h2>
                <Button variant="outline" size="sm" onClick={goToToday} className="text-xs">
                  Aujourd&apos;hui
                </Button>
              </div>
              <Button variant="ghost" size="icon" onClick={() => navigateDay(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Agenda Grid */}
            {loading ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-12 flex-1" />
                  </div>
                ))}
              </div>
            ) : (
              <ScrollArea className="max-h-[520px]">
                <div className="divide-y">
                  {TIME_SLOTS.map((time) => {
                    const apt = getAppointmentForSlot(time)
                    const isStart = getAppointmentStartSlot(time)
                    const available = isSlotAvailable(time)
                    const isOccupied = apt && apt.status !== 'ANNULE' && apt.status !== 'REFUSE'

                    return (
                      <div
                        key={time}
                        className="flex items-stretch min-h-[48px] group"
                      >
                        {/* Time label */}
                        <div className="w-16 shrink-0 flex items-center justify-center text-xs font-medium text-muted-foreground border-r py-2">
                          {time}
                        </div>

                        {/* Slot content */}
                        <div
                          className={`flex-1 px-3 py-1.5 cursor-pointer transition-colors ${
                            isStart && apt
                              ? ''
                              : available
                                ? 'hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                                : 'hover:bg-accent/50'
                          }`}
                          onClick={() => {
                            if (isStart && apt) {
                              openDetail(apt)
                            } else if (available) {
                              openCreateDialog(time)
                            }
                          }}
                        >
                          {isStart && apt ? (
                            <div
                              className={`rounded-lg border px-3 py-2 ${SLOT_COLORS[apt.status] || 'bg-gray-100 border-gray-300'}`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="font-medium text-sm truncate">
                                    {apt.user.firstName} {apt.user.lastName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {apt.startTime} - {apt.endTime} · {MOTIF_LABELS[apt.motif] || apt.motif}
                                  </p>
                                </div>
                                <Badge variant="outline" className={`text-xs shrink-0 ${STATUS_CONFIG[apt.status]?.color || ''}`}>
                                  {STATUS_CONFIG[apt.status]?.label || apt.status}
                                </Badge>
                              </div>
                            </div>
                          ) : available ? (
                            <div className="flex items-center justify-center h-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-xs text-emerald-600 font-medium">+ Disponible</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </Card>
        </div>

        {/* Pending Requests Sidebar */}
        <div className="w-full lg:w-80 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Demandes en attente
                {pendingAppointments.length > 0 && (
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200 ml-auto">
                    {pendingAppointments.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingAppointments.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Aucune demande en attente</p>
                </div>
              ) : (
                <ScrollArea className="max-h-96">
                  <div className="space-y-3">
                    {pendingAppointments.map((apt) => (
                      <div key={apt.id} className="rounded-lg border p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm">
                              {apt.user.firstName} {apt.user.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {apt.date} · {apt.startTime}-{apt.endTime}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs text-amber-700 bg-amber-50 border-amber-200 shrink-0">
                            En attente
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Motif: {MOTIF_LABELS[apt.motif] || apt.motif}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Abbé: P. {apt.abbe.firstName} {apt.abbe.lastName}
                        </p>
                        <div className="flex gap-2 pt-1">
                          <Button
                            size="sm"
                            className="flex-1 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => handleAction(apt.id, 'confirm')}
                          >
                            <CheckCircle className="h-3 w-3" />
                            Accepter
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1 gap-1"
                            onClick={() => handleAction(apt.id, 'reject')}
                          >
                            <XCircle className="h-3 w-3" />
                            Refuser
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Légende</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { color: 'bg-emerald-100 border-emerald-300', label: 'Disponible' },
                { color: 'bg-emerald-100 border-emerald-300', label: 'Confirmé', dot: 'bg-emerald-500' },
                { color: 'bg-red-100 border-red-300', label: 'Occupé', dot: 'bg-red-500' },
                { color: 'bg-amber-100 border-amber-300', label: 'En attente', dot: 'bg-amber-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  <div className={`w-4 h-4 rounded border ${item.color} flex items-center justify-center`}>
                    {item.dot && <div className={`w-2 h-2 rounded-full ${item.dot}`} />}
                  </div>
                  <span className="text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── Create Appointment Dialog ────────────────────────────── */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau rendez-vous</DialogTitle>
            <DialogDescription>
              Prenez un rendez-vous avec un abbé.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Fidèle search */}
            <div className="space-y-2">
              <Label>Fidèle *</Label>
              {form.userId ? (
                <div className="flex items-center gap-2 p-2 rounded-lg border bg-accent/50">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {getInitials(form.userName.split(' ')[0] || 'U', form.userName.split(' ')[1] || '')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium flex-1">{form.userName}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, userId: '', userName: '' }))
                      setFideleSearch('')
                    }}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Input
                      placeholder="Rechercher un fidèle par nom..."
                      value={fideleSearch}
                      onChange={(e) => setFideleSearch(e.target.value)}
                    />
                    {searchingFidele && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      </div>
                    )}
                  </div>
                  {fideleResults.length > 0 && (
                    <div className="max-h-40 overflow-y-auto rounded-md border">
                      {fideleResults.map((fidele) => (
                        <button
                          key={fidele.id}
                          className="w-full flex items-center gap-2 p-2 hover:bg-accent/50 text-left transition-colors"
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              userId: fidele.id,
                              userName: `${fidele.firstName} ${fidele.lastName}`,
                            }))
                            setFideleSearch('')
                            setFideleResults([])
                          }}
                        >
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {getInitials(fidele.firstName, fidele.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{fidele.firstName} {fidele.lastName}</p>
                            <p className="text-xs text-muted-foreground">{fidele.phone || fidele.id}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Abbé */}
            <div className="space-y-2">
              <Label>Abbé *</Label>
              <Select
                value={form.abbeId}
                onValueChange={(v) => setForm((prev) => ({ ...prev, abbeId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un abbé" />
                </SelectTrigger>
                <SelectContent>
                  {abbes.map((abbe) => (
                    <SelectItem key={abbe.id} value={abbe.id}>
                      P. {abbe.firstName} {abbe.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              />
            </div>

            {/* Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Heure début *</Label>
                <Select
                  value={form.startTime}
                  onValueChange={(v) => {
                    const [h, m] = v.split(':').map(Number)
                    const endH = m === 30 ? h + 1 : h
                    const endM = m === 30 ? 0 : 30
                    setForm((prev) => ({
                      ...prev,
                      startTime: v,
                      endTime: `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`,
                    }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Début" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.slice(0, -2).map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Heure fin *</Label>
                <Select
                  value={form.endTime}
                  onValueChange={(v) => setForm((prev) => ({ ...prev, endTime: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Fin" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.filter((t) => t > (form.startTime || '00:00')).map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Motif */}
            <div className="space-y-2">
              <Label>Motif *</Label>
              <Select
                value={form.motif}
                onValueChange={(v) => setForm((prev) => ({ ...prev, motif: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOTIF_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Informations supplémentaires..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleCreate}
              disabled={submitting || !form.userId || !form.abbeId || !form.startTime || !form.endTime}
            >
              {submitting ? 'Création...' : 'Créer le RDV'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Appointment Detail Dialog ────────────────────────────── */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Détails du rendez-vous</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 shadow-sm">
                  {selectedAppointment.user.avatarUrl ? (
                    <AvatarImage src={selectedAppointment.user.avatarUrl} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials(selectedAppointment.user.firstName, selectedAppointment.user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">
                    {selectedAppointment.user.firstName} {selectedAppointment.user.lastName}
                  </p>
                  <Badge variant="outline" className={`text-xs ${STATUS_CONFIG[selectedAppointment.status]?.color || ''}`}>
                    {STATUS_CONFIG[selectedAppointment.status]?.label || selectedAppointment.status}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{selectedAppointment.date} · {selectedAppointment.startTime} - {selectedAppointment.endTime}</span>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>Abbé: P. {selectedAppointment.abbe.firstName} {selectedAppointment.abbe.lastName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>Motif: {MOTIF_LABELS[selectedAppointment.motif] || selectedAppointment.motif}</span>
                </div>
                {selectedAppointment.notesFidele && (
                  <div className="rounded-lg border p-3 bg-accent/30">
                    <p className="text-xs text-muted-foreground mb-1">Notes du fidèle</p>
                    <p className="text-sm">{selectedAppointment.notesFidele}</p>
                  </div>
                )}
                {selectedAppointment.canceledReason && (
                  <div className="rounded-lg border p-3 bg-red-50 border-red-200">
                    <p className="text-xs text-red-600 mb-1">Raison d&apos;annulation</p>
                    <p className="text-sm text-red-700">{selectedAppointment.canceledReason}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {selectedAppointment.status === 'EN_ATTENTE' && (
                  <>
                    <Button
                      className="flex-1 gap-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleAction(selectedAppointment.id, 'confirm')}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Accepter
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 gap-1"
                      onClick={() => handleAction(selectedAppointment.id, 'reject')}
                    >
                      <XCircle className="h-4 w-4" />
                      Refuser
                    </Button>
                  </>
                )}
                {(selectedAppointment.status === 'CONFIRME' || selectedAppointment.status === 'EN_ATTENTE') && (
                  <Button
                    variant="outline"
                    className="gap-1"
                    onClick={() => handleAction(selectedAppointment.id, 'cancel')}
                  >
                    <XCircle className="h-4 w-4" />
                    Annuler
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
