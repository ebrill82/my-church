'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  Megaphone,
  Send,
  Mail,
  MessageSquare,
  Plus,
  Eye,
  Pencil,
  Smartphone,
  Crown,
  Bell,
  Check,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

// ─── Types ──────────────────────────────────────────────────────────────────

interface Notification {
  id: string
  userId: string
  type: string
  title: string
  body: string
  link: string | null
  isRead: boolean
  createdAt: string
  user?: {
    firstName: string
    lastName: string
  }
}

interface Group {
  id: string
  name: string
  type: string
}

interface Member {
  id: string
  firstName: string
  lastName: string
  email: string
}

// ─── Constants ──────────────────────────────────────────────────────────────

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  RDV: 'Rendez-vous',
  ACTIVITY: 'Activité',
  GROUP_INVITE: 'Invitation groupe',
  DONATION: 'Don',
  CERTIFICATE: 'Certificat',
  SYSTEM: 'Système',
  MESSAGE: 'Message',
}

const NOTIFICATION_TYPE_COLORS: Record<string, string> = {
  RDV: 'bg-amber-100 text-amber-700 border-amber-200',
  ACTIVITY: 'bg-blue-100 text-blue-700 border-blue-200',
  GROUP_INVITE: 'bg-purple-100 text-purple-700 border-purple-200',
  DONATION: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CERTIFICATE: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  SYSTEM: 'bg-gray-100 text-gray-700 border-gray-200',
  MESSAGE: 'bg-rose-100 text-rose-700 border-rose-200',
}

const EMAIL_TEMPLATES = [
  { id: 'welcome', name: 'Bienvenue', description: 'Email de bienvenue aux nouveaux fidèles', icon: '👋' },
  { id: 'appointment-confirm', name: 'Confirmation RDV', description: 'Confirmation de rendez-vous', icon: '📅' },
  { id: 'appointment-reminder', name: 'Rappel RDV', description: 'Rappel de rendez-vous à venir', icon: '⏰' },
  { id: 'donation-receipt', name: 'Reçu de don', description: 'Reçu pour un don effectué', icon: '🧾' },
  { id: 'certificate-ready', name: 'Certificat prêt', description: 'Notification de certificat prêt', icon: '📜' },
  { id: 'group-invite', name: 'Invitation groupe', description: 'Invitation à rejoindre un groupe', icon: '👥' },
]

// ─── Component ──────────────────────────────────────────────────────────────

export default function CommunicationPage() {
  const { church, user } = useAppStore()
  const churchId = church?.id

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  // Send notification dialog
  const [sendNotifOpen, setSendNotifOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [notifForm, setNotifForm] = useState({
    target: 'all' as string,
    groupId: '',
    userId: '',
    title: '',
    body: '',
    link: '',
    type: 'SYSTEM',
  })

  // SMS dialog
  const [smsOpen, setSmsOpen] = useState(false)
  const [smsForm, setSmsForm] = useState({
    target: 'all' as string,
    groupId: '',
    userId: '',
    message: '',
  })

  const isPremium = church?.plan === 'PREMIUM' || church?.plan === 'DIOCESE'

  // ─── Fetch data ───────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!churchId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/notifications?churchId=${churchId}`)
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [churchId])

  const fetchGroups = useCallback(async () => {
    if (!churchId) return
    try {
      const res = await fetch(`/api/groups?churchId=${churchId}`)
      if (res.ok) {
        const data = await res.json()
        setGroups(data.groups || [])
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
    }
  }, [churchId])

  const fetchMembers = useCallback(async () => {
    if (!churchId) return
    try {
      const res = await fetch(`/api/churches/${churchId}/members?limit=200&status=active`)
      if (res.ok) {
        const data = await res.json()
        setMembers(data.members || [])
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }, [churchId])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    fetchGroups()
    fetchMembers()
  }, [fetchGroups, fetchMembers])

  // ─── Handlers ─────────────────────────────────────────────────────────
  const handleSendNotification = async () => {
    if (!churchId || !notifForm.title || !notifForm.body) return
    setSubmitting(true)
    try {
      const target: Record<string, string> = {}
      if (notifForm.target === 'all') {
        target.type = 'all'
      } else if (notifForm.target === 'group' && notifForm.groupId) {
        target.type = 'group'
        target.groupId = notifForm.groupId
      } else if (notifForm.target === 'user' && notifForm.userId) {
        target.type = 'user'
        target.userId = notifForm.userId
      }

      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          churchId,
          target,
          title: notifForm.title,
          body: notifForm.body,
          type: notifForm.type,
          link: notifForm.link || undefined,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success(`${data.sent} notification(s) envoyée(s)`)
        setSendNotifOpen(false)
        setNotifForm({ target: 'all', groupId: '', userId: '', title: '', body: '', link: '', type: 'SYSTEM' })
        fetchNotifications()
      } else {
        toast.error("Erreur lors de l'envoi")
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      toast.error("Erreur lors de l'envoi")
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  // Count read notifications per notification (demo: random for now)
  const getReadCount = (_notif: Notification) => {
    // In a real app, we'd track reads per notification
    return Math.floor(Math.random() * 10) + 1
  }

  const getTargetLabel = (notif: Notification) => {
    // Demo: just show "Tous" or specific
    return notif.type === 'SYSTEM' ? 'Tous les fidèles' : 'Fidèles ciblés'
  }

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" />
            Communication
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gérez vos notifications, emails et SMS
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications" className="gap-1.5">
            <Bell className="h-3.5 w-3.5" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="emails" className="gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            Emails
          </TabsTrigger>
          <TabsTrigger value="sms" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            SMS
            {!isPremium && (
              <Badge className="ml-1 text-[9px] px-1 py-0 bg-[#C9A84C] text-[#1B3A5C] border-0 font-bold">
                PRO
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ─── Notifications Tab ──────────────────────────────────────── */}
        <TabsContent value="notifications" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Historique des notifications</h2>
            <Button onClick={() => setSendNotifOpen(true)} className="gap-2">
              <Send className="h-4 w-4" />
              Envoyer une notification
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <Bell className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="text-lg font-medium">Aucune notification</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Envoyez votre première notification à vos fidèles
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden md:table-cell">Cible</TableHead>
                    <TableHead className="hidden sm:table-cell">Lu par</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.slice(0, 20).map((notif) => (
                    <TableRow key={notif.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(notif.createdAt)}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">{notif.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                          {notif.body}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${NOTIFICATION_TYPE_COLORS[notif.type] || NOTIFICATION_TYPE_COLORS.SYSTEM}`}
                        >
                          {NOTIFICATION_TYPE_LABELS[notif.type] || notif.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {getTargetLabel(notif)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-1">
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span className="text-sm">{getReadCount(notif)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* ─── Emails Tab ─────────────────────────────────────────────── */}
        <TabsContent value="emails" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Templates d&apos;emails</h2>
            <Button variant="outline" className="gap-2" onClick={() => toast.info('Fonctionnalité à venir')}>
              <Plus className="h-4 w-4" />
              Créer un template
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EMAIL_TEMPLATES.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{template.icon}</span>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-xs">{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => toast.info('Aperçu à venir')}>
                      <Eye className="h-3 w-3" />
                      Aperçu
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => toast.info('Édition à venir')}>
                      <Pencil className="h-3 w-3" />
                      Éditer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ─── SMS Tab ─────────────────────────────────────────────────── */}
        <TabsContent value="sms" className="space-y-4">
          {!isPremium && (
            <Card className="border-[#C9A84C]/30 bg-[#C9A84C]/5">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A84C]/20">
                  <Crown className="h-5 w-5 text-[#C9A84C]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Fonctionnalité Premium</p>
                  <p className="text-xs text-muted-foreground">
                    Passez au plan Premium pour envoyer des SMS à vos fidèles
                  </p>
                </div>
                <Button size="sm" className="bg-[#C9A84C] text-[#1B3A5C] hover:bg-[#C9A84C]/90">
                  Passer à Premium
                </Button>
              </CardContent>
            </Card>
          )}

          {/* SMS Credits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Crédits SMS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Crédits restants</span>
                    <span className="font-semibold">
                      450 / 500
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: '90%' }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    50 SMS utilisés ce mois-ci
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Send SMS Button */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Envoyer un SMS</h2>
            <Button
              className="gap-2"
              onClick={() => {
                if (!isPremium) {
                  toast.error('Fonctionnalité Premium uniquement')
                  return
                }
                setSmsOpen(true)
              }}
            >
              <MessageSquare className="h-4 w-4" />
              Envoyer un SMS
            </Button>
          </div>

          {/* SMS History (demo) */}
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="hidden md:table-cell">Cible</TableHead>
                  <TableHead className="hidden sm:table-cell">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { date: '15/01/2025', message: 'Rappel messe dominicale demain 10h', target: 'Tous', status: 'Envoyé' },
                  { date: '12/01/2025', message: 'Confirmation de votre rendez-vous le 14/01', target: 'Marie Dupont', status: 'Envoyé' },
                  { date: '08/01/2025', message: 'Réunion chorale ce mercredi 19h', target: 'Chorale', status: 'Envoyé' },
                ].map((sms, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{sms.date}</TableCell>
                    <TableCell className="text-sm max-w-[250px] truncate">{sms.message}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{sms.target}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">{sms.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── Send Notification Dialog ──────────────────────────────────── */}
      <Dialog open={sendNotifOpen} onOpenChange={setSendNotifOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Envoyer une notification</DialogTitle>
            <DialogDescription>
              Envoyez une notification à vos fidèles
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Cible *</Label>
              <Select value={notifForm.target} onValueChange={(v) => setNotifForm({ ...notifForm, target: v, groupId: '', userId: '' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les fidèles</SelectItem>
                  <SelectItem value="group">Un groupe spécifique</SelectItem>
                  <SelectItem value="user">Un fidèle spécifique</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {notifForm.target === 'group' && (
              <div className="space-y-2">
                <Label>Groupe *</Label>
                <Select value={notifForm.groupId} onValueChange={(v) => setNotifForm({ ...notifForm, groupId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un groupe" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {notifForm.target === 'user' && (
              <div className="space-y-2">
                <Label>Fidèle *</Label>
                <Select value={notifForm.userId} onValueChange={(v) => setNotifForm({ ...notifForm, userId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un fidèle" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.slice(0, 50).map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.firstName} {m.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notif-title">Titre *</Label>
              <Input
                id="notif-title"
                value={notifForm.title}
                onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                placeholder="Titre de la notification"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notif-body">Message *</Label>
              <Textarea
                id="notif-body"
                value={notifForm.body}
                onChange={(e) => setNotifForm({ ...notifForm, body: e.target.value })}
                placeholder="Contenu de la notification"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notif-link">Lien (optionnel)</Label>
              <Input
                id="notif-link"
                value={notifForm.link}
                onChange={(e) => setNotifForm({ ...notifForm, link: e.target.value })}
                placeholder="/dashboard/activities/..."
              />
            </div>

            <div className="space-y-2">
              <Label>Type *</Label>
              <Select value={notifForm.type} onValueChange={(v) => setNotifForm({ ...notifForm, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(NOTIFICATION_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendNotifOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSendNotification}
              disabled={submitting || !notifForm.title || !notifForm.body}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {submitting ? 'Envoi...' : 'Envoyer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Send SMS Dialog ──────────────────────────────────────────── */}
      <Dialog open={smsOpen} onOpenChange={setSmsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Envoyer un SMS</DialogTitle>
            <DialogDescription>
              Envoyez un SMS à vos fidèles (160 caractères max)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Cible *</Label>
              <Select value={smsForm.target} onValueChange={(v) => setSmsForm({ ...smsForm, target: v, groupId: '', userId: '' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les fidèles</SelectItem>
                  <SelectItem value="group">Un groupe spécifique</SelectItem>
                  <SelectItem value="user">Un fidèle spécifique</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {smsForm.target === 'group' && (
              <div className="space-y-2">
                <Label>Groupe *</Label>
                <Select value={smsForm.groupId} onValueChange={(v) => setSmsForm({ ...smsForm, groupId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un groupe" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {smsForm.target === 'user' && (
              <div className="space-y-2">
                <Label>Fidèle *</Label>
                <Select value={smsForm.userId} onValueChange={(v) => setSmsForm({ ...smsForm, userId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un fidèle" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.slice(0, 50).map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.firstName} {m.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="sms-message">Message *</Label>
                <span className={`text-xs ${smsForm.message.length > 160 ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {smsForm.message.length} / 160
                </span>
              </div>
              <Textarea
                id="sms-message"
                value={smsForm.message}
                onChange={(e) => setSmsForm({ ...smsForm, message: e.target.value.slice(0, 200) })}
                placeholder="Votre message SMS..."
                rows={4}
              />
            </div>

            {/* Phone mockup preview */}
            <div className="flex justify-center">
              <div className="w-64 rounded-3xl border-2 border-gray-300 bg-gray-100 p-4 dark:border-gray-600 dark:bg-gray-800">
                <div className="mb-2 text-center">
                  <div className="inline-flex h-6 w-20 rounded-full bg-gray-300 dark:bg-gray-600" />
                </div>
                <div className="rounded-xl bg-white dark:bg-gray-700 p-3 min-h-[80px]">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <Users className="inline h-3 w-3 mr-1" />
                    {smsForm.target === 'all' ? 'Tous les fidèles' : smsForm.target === 'group' ? 'Groupe' : 'Fidèle'}
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {smsForm.message || 'Aperçu du message...'}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-8 rounded-full bg-white dark:bg-gray-700 border dark:border-gray-600 px-3 flex items-center">
                    <span className="text-xs text-gray-400">Message</span>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Send className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSmsOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                toast.success('SMS envoyé (démo)')
                setSmsOpen(false)
                setSmsForm({ target: 'all', groupId: '', userId: '', message: '' })
              }}
              disabled={smsForm.message.length === 0 || smsForm.message.length > 160}
              className="gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
