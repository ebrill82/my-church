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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  UsersRound,
  Plus,
  ChevronRight,
  UserPlus,
  XCircle,
  Calendar,
  Clock,
  MapPin,
  User,
  Search,
  Shield,
  Mail,
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Types ──────────────────────────────────────────────────────────────

interface GroupAdmin {
  id: string
  firstName: string
  lastName: string
  avatarUrl: string | null
}

interface GroupData {
  id: string
  churchId: string
  adminId: string
  name: string
  description: string | null
  type: string
  imageUrl: string | null
  maxMembers: number | null
  isActive: boolean
  createdAt: string
  admin: GroupAdmin
  _count: {
    groupMembers: number
  }
}

interface GroupMemberData {
  id: string
  groupId: string
  userId: string
  role: string
  status: string
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    avatarUrl: string | null
    email: string
  }
}

interface GroupActivityData {
  id: string
  title: string
  startDateTime: string
  endDateTime: string
  location: string | null
}

interface GroupDetailData {
  id: string
  name: string
  description: string | null
  type: string
  imageUrl: string | null
  maxMembers: number | null
  isActive: boolean
  createdAt: string
  admin: GroupAdmin
  groupMembers: GroupMemberData[]
  activities: GroupActivityData[]
}

interface MemberUser {
  id: string
  firstName: string
  lastName: string
  email: string
  avatarUrl: string | null
}

// ─── Constants ──────────────────────────────────────────────────────────

const GROUP_TYPE_COLORS: Record<string, string> = {
  SCOUT: 'bg-emerald-500',
  CHORALE: 'bg-amber-500',
  LECTEURS: 'bg-blue-500',
  ENFANTS_COEUR: 'bg-pink-500',
  JEUNES: 'bg-violet-500',
  AUTRE: 'bg-gray-500',
}

const GROUP_TYPE_LABELS: Record<string, string> = {
  SCOUT: 'Scouts',
  CHORALE: 'Chorale',
  LECTEURS: 'Lecteurs',
  ENFANTS_COEUR: 'Enfants de chœur',
  JEUNES: 'Jeunes',
  AUTRE: 'Autre',
}

const GROUP_TYPE_BADGE: Record<string, string> = {
  SCOUT: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  CHORALE: 'text-amber-700 bg-amber-50 border-amber-200',
  LECTEURS: 'text-blue-700 bg-blue-50 border-blue-200',
  ENFANTS_COEUR: 'text-pink-700 bg-pink-50 border-pink-200',
  JEUNES: 'text-violet-700 bg-violet-50 border-violet-200',
  AUTRE: 'text-gray-700 bg-gray-50 border-gray-200',
}

const MEMBER_ROLE_LABELS: Record<string, string> = {
  ADMIN_GROUP: 'Administrateur',
  MEMBER: 'Membre',
}

const AVATAR_COLORS = [
  'bg-emerald-500',
  'bg-amber-500',
  'bg-blue-500',
  'bg-violet-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-teal-500',
]

function getInitials(firstName: string, lastName: string): string {
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
}

function getAvatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

// ─── Component ──────────────────────────────────────────────────────────

export default function GroupsPage() {
  const { church, user } = useAppStore()
  const churchId = church?.id

  const [groups, setGroups] = useState<GroupData[]>([])
  const [loading, setLoading] = useState(true)

  // Detail sheet
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [groupDetail, setGroupDetail] = useState<GroupDetailData | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Create group dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Invite members dialog
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [memberSearch, setMemberSearch] = useState('')
  const [memberResults, setMemberResults] = useState<MemberUser[]>([])
  const [searchingMembers, setSearchingMembers] = useState(false)
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [inviting, setInviting] = useState(false)

  // Form
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'CHORALE',
    maxMembers: '',
    adminId: '',
  })

  // Admin candidates
  const [adminCandidates, setAdminCandidates] = useState<MemberUser[]>([])

  // ─── Fetch Groups ───────────────────────────────────────────────
  const fetchGroups = useCallback(async () => {
    if (!churchId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/groups?churchId=${churchId}`)
      if (res.ok) {
        const data = await res.json()
        setGroups(data.groups || [])
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
    } finally {
      setLoading(false)
    }
  }, [churchId])

  // ─── Fetch Group Detail ─────────────────────────────────────────
  const fetchGroupDetail = useCallback(async (groupId: string) => {
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/groups/${groupId}`)
      if (res.ok) {
        const data = await res.json()
        setGroupDetail(data.group || null)
      }
    } catch (error) {
      console.error('Error fetching group detail:', error)
    } finally {
      setDetailLoading(false)
    }
  }, [])

  // ─── Fetch Admin Candidates ─────────────────────────────────────
  const fetchAdminCandidates = useCallback(async () => {
    if (!churchId) return
    try {
      const res = await fetch(`/api/churches/${churchId}/members?limit=50&status=active`)
      if (res.ok) {
        const data = await res.json()
        setAdminCandidates(data.members || [])
      }
    } catch (error) {
      console.error('Error fetching admin candidates:', error)
    }
  }, [churchId])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  useEffect(() => {
    fetchAdminCandidates()
  }, [fetchAdminCandidates])

  // ─── Search Members for Invite ──────────────────────────────────
  const searchMembers = useCallback(async (query: string) => {
    if (!churchId || query.length < 2) {
      setMemberResults([])
      return
    }
    setSearchingMembers(true)
    try {
      const res = await fetch(`/api/churches/${churchId}/members?search=${encodeURIComponent(query)}&limit=20&status=active`)
      if (res.ok) {
        const data = await res.json()
        setMemberResults(data.members || [])
      }
    } catch (error) {
      console.error('Error searching members:', error)
    } finally {
      setSearchingMembers(false)
    }
  }, [churchId])

  useEffect(() => {
    const timer = setTimeout(() => searchMembers(memberSearch), 300)
    return () => clearTimeout(timer)
  }, [memberSearch, searchMembers])

  // ─── Handlers ───────────────────────────────────────────────────
  const openGroupDetail = (groupId: string) => {
    setSelectedGroupId(groupId)
    setSheetOpen(true)
    fetchGroupDetail(groupId)
  }

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      type: 'CHORALE',
      maxMembers: '',
      adminId: '',
    })
  }

  const handleCreateGroup = async () => {
    if (!churchId || !form.name || !form.adminId) {
      toast.error('Veuillez remplir le nom et l\'administrateur')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          churchId,
          name: form.name,
          description: form.description || null,
          type: form.type,
          maxMembers: form.maxMembers ? parseInt(form.maxMembers) : null,
          adminId: form.adminId,
        }),
      })
      if (res.ok) {
        toast.success('Groupe créé avec succès')
        setCreateDialogOpen(false)
        resetForm()
        fetchGroups()
      } else {
        const data = await res.json()
        toast.error(data.message || 'Erreur lors de la création')
      }
    } catch (error) {
      console.error('Error creating group:', error)
      toast.error('Erreur lors de la création')
    } finally {
      setSubmitting(false)
    }
  }

  const handleInviteMembers = async () => {
    if (!selectedGroupId || selectedMemberIds.length === 0) return
    setInviting(true)
    try {
      // Create group member invites
      const promises = selectedMemberIds.map((userId) =>
        fetch(`/api/groups/${selectedGroupId}/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            invitedById: user?.id || churchId,
            role: 'MEMBER',
          }),
        })
      )
      await Promise.all(promises)
      toast.success(`${selectedMemberIds.length} membre(s) invité(s)`)
      setInviteDialogOpen(false)
      setSelectedMemberIds([])
      setMemberSearch('')
      setMemberResults([])
      fetchGroupDetail(selectedGroupId)
    } catch (error) {
      console.error('Error inviting members:', error)
      toast.error('Erreur lors de l\'invitation')
    } finally {
      setInviting(false)
    }
  }

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    )
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const formatDateTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <UsersRound className="h-6 w-6 text-primary" />
            Groupes & Communautés
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {groups.length} groupe{groups.length !== 1 ? 's' : ''} actif{groups.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => { resetForm(); setCreateDialogOpen(true) }} className="gap-2">
          <Plus className="h-4 w-4" />
          Créer un groupe
        </Button>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <UsersRound className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">Aucun groupe trouvé</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Commencez par créer votre premier groupe ou communauté
          </p>
          <Button className="mt-4 gap-2" onClick={() => { resetForm(); setCreateDialogOpen(true) }}>
            <Plus className="h-4 w-4" />
            Créer un groupe
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => {
            const typeColor = GROUP_TYPE_COLORS[group.type] || 'bg-gray-500'
            const typeLabel = GROUP_TYPE_LABELS[group.type] || group.type
            const typeBadge = GROUP_TYPE_BADGE[group.type] || 'text-gray-700 bg-gray-50 border-gray-200'
            const memberCount = group._count?.groupMembers || 0

            return (
              <Card
                key={group.id}
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => openGroupDetail(group.id)}
              >
                {/* Color bar at top */}
                <div className={`h-1.5 ${typeColor}`} />
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-3">
                    {/* Group icon */}
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white font-bold text-lg shrink-0 ${typeColor}`}>
                      {group.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm truncate">{group.name}</h3>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <Badge variant="outline" className={`text-[10px] mt-1 ${typeBadge}`}>
                        {typeLabel}
                      </Badge>
                    </div>
                  </div>

                  {group.description && (
                    <p className="text-xs text-muted-foreground mt-3 line-clamp-2">
                      {group.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {memberCount} membre{memberCount !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {group.admin.firstName} {group.admin.lastName}
                    </span>
                  </div>

                  {group.maxMembers && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Capacité</span>
                        <span>{memberCount}/{group.maxMembers}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${typeColor}`}
                          style={{ width: `${Math.min(100, (memberCount / group.maxMembers) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* ─── Group Detail Sheet ─────────────────────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            {groupDetail && (
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white font-bold text-lg ${GROUP_TYPE_COLORS[groupDetail.type] || 'bg-gray-500'}`}>
                  {groupDetail.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <SheetTitle className="text-left">{groupDetail.name}</SheetTitle>
                  <Badge variant="outline" className={`text-xs mt-1 ${GROUP_TYPE_BADGE[groupDetail.type] || ''}`}>
                    {GROUP_TYPE_LABELS[groupDetail.type] || groupDetail.type}
                  </Badge>
                </div>
              </div>
            )}
          </SheetHeader>

          {detailLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : groupDetail ? (
            <div className="py-4">
              <Tabs defaultValue="infos" className="space-y-4">
                <TabsList className="w-full">
                  <TabsTrigger value="infos" className="flex-1">Infos</TabsTrigger>
                  <TabsTrigger value="members" className="flex-1">Membres</TabsTrigger>
                  <TabsTrigger value="activities" className="flex-1">Activités</TabsTrigger>
                </TabsList>

                {/* Infos Tab */}
                <TabsContent value="infos" className="space-y-4">
                  <div className="space-y-3 text-sm">
                    {groupDetail.description && (
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Description</p>
                        <p>{groupDetail.description}</p>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Administrateur</span>
                      <span className="font-medium">
                        {groupDetail.admin.firstName} {groupDetail.admin.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Membres</span>
                      <span className="font-medium">
                        {groupDetail.groupMembers.length}
                        {groupDetail.maxMembers ? ` / ${groupDetail.maxMembers}` : ''}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Créé le</span>
                      <span className="font-medium">{formatDate(groupDetail.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Statut</span>
                      <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                        {groupDetail.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </div>
                </TabsContent>

                {/* Members Tab */}
                <TabsContent value="members" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">
                      {groupDetail.groupMembers.length} membre{groupDetail.groupMembers.length !== 1 ? 's' : ''}
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => {
                        setSelectedMemberIds([])
                        setMemberSearch('')
                        setMemberResults([])
                        setInviteDialogOpen(true)
                      }}
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Inviter
                    </Button>
                  </div>

                  {groupDetail.groupMembers.length === 0 ? (
                    <div className="text-center py-8">
                      <UsersRound className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Aucun membre pour le moment</p>
                    </div>
                  ) : (
                    <ScrollArea className="max-h-80">
                      <div className="space-y-2">
                        {groupDetail.groupMembers.map((gm) => (
                          <div
                            key={gm.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <Avatar className="h-9 w-9">
                              {gm.user.avatarUrl ? (
                                <AvatarImage src={gm.user.avatarUrl} />
                              ) : null}
                              <AvatarFallback className={`text-xs text-white ${getAvatarColor(gm.user.firstName)}`}>
                                {getInitials(gm.user.firstName, gm.user.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {gm.user.firstName} {gm.user.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                <Mail className="h-2.5 w-2.5 inline mr-1" />
                                {gm.user.email}
                              </p>
                            </div>
                            <div className="shrink-0 flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${
                                  gm.role === 'ADMIN_GROUP'
                                    ? 'text-amber-700 bg-amber-50 border-amber-200'
                                    : 'text-gray-600 bg-gray-50 border-gray-200'
                                }`}
                              >
                                {MEMBER_ROLE_LABELS[gm.role] || gm.role}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </TabsContent>

                {/* Activities Tab */}
                <TabsContent value="activities" className="space-y-4">
                  <h4 className="text-sm font-medium">Activités à venir</h4>
                  {groupDetail.activities.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Aucune activité à venir</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {groupDetail.activities.map((activity) => (
                        <div key={activity.id} className="rounded-lg border p-3 space-y-1.5">
                          <p className="font-medium text-sm">{activity.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDateTime(activity.startDateTime)}
                          </div>
                          {activity.location && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {activity.location}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">Groupe non trouvé</p>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ─── Create Group Dialog ────────────────────────────────── */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un groupe</DialogTitle>
            <DialogDescription>
              Créez un nouveau groupe ou communauté paroissiale.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">Nom du groupe *</Label>
              <Input
                id="group-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Chorale Saint Michel"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="group-type">Type *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(GROUP_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="group-max">Max membres</Label>
                <Input
                  id="group-max"
                  type="number"
                  value={form.maxMembers}
                  onChange={(e) => setForm({ ...form, maxMembers: e.target.value })}
                  placeholder="Illimité"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="group-admin">Administrateur *</Label>
              <Select value={form.adminId} onValueChange={(v) => setForm({ ...form, adminId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un administrateur" />
                </SelectTrigger>
                <SelectContent>
                  {adminCandidates.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.firstName} {member.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="group-desc">Description</Label>
              <Textarea
                id="group-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Description du groupe..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleCreateGroup}
              disabled={submitting || !form.name || !form.adminId}
            >
              {submitting ? 'Création...' : 'Créer le groupe'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Invite Members Dialog ──────────────────────────────── */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inviter des membres</DialogTitle>
            <DialogDescription>
              Recherchez et sélectionnez les membres à inviter dans le groupe.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un membre..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="pl-9"
              />
              {searchingMembers && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}
            </div>

            {/* Selected count */}
            {selectedMemberIds.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary">{selectedMemberIds.length} sélectionné(s)</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={() => setSelectedMemberIds([])}
                >
                  Tout désélectionner
                </Button>
              </div>
            )}

            {/* Member list */}
            <ScrollArea className="max-h-60">
              <div className="space-y-1">
                {memberResults.length === 0 && memberSearch.length >= 2 && !searchingMembers && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun membre trouvé
                  </p>
                )}
                {memberResults.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 cursor-pointer"
                    onClick={() => toggleMemberSelection(member.id)}
                  >
                    <Checkbox
                      checked={selectedMemberIds.includes(member.id)}
                      onCheckedChange={() => toggleMemberSelection(member.id)}
                    />
                    <Avatar className="h-8 w-8">
                      {member.avatarUrl ? (
                        <AvatarImage src={member.avatarUrl} />
                      ) : null}
                      <AvatarFallback className={`text-xs text-white ${getAvatarColor(member.firstName)}`}>
                        {getInitials(member.firstName, member.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                    </div>
                  </div>
                ))}
                {memberSearch.length < 2 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Tapez au moins 2 caractères pour rechercher
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleInviteMembers}
              disabled={inviting || selectedMemberIds.length === 0}
            >
              {inviting ? 'Invitation...' : `Inviter ${selectedMemberIds.length} membre(s)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
