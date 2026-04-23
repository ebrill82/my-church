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
import { Checkbox } from '@/components/ui/checkbox'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Plus,
  Download,
  MoreHorizontal,
  Eye,
  Pencil,
  UserCheck,
  UserX,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'

interface GroupMemberData {
  group: {
    id: string
    name: string
    type: string
  }
}

interface Member {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatarUrl: string | null
  role: string
  isActive: boolean
  emailVerified: boolean
  createdAt: string
  groupMembers: GroupMemberData[]
}

interface MembersResponse {
  members: Member[]
  total: number
  page: number
  totalPages: number
}

interface Group {
  id: string
  name: string
  type: string
}

type SortField = 'firstName' | 'lastName' | 'email' | 'createdAt'
type SortOrder = 'asc' | 'desc'

const AVATAR_COLORS = [
  'bg-rose-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-cyan-500',
  'bg-violet-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-orange-500',
]

function getAvatarColor(name: string): string {
  const index = name.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}

function getInitials(firstName: string, lastName: string): string {
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN_PAROISSE: 'Admin Paroisse',
  ABBE: 'Abbé',
  DIRIGEANT_GROUPE: 'Dirigeant',
  PAROISSIEN: 'Paroissien',
  VISITEUR: 'Visiteur',
}

export default function MembersPage() {
  const { churchId } = useAppStore()
  const [members, setMembers] = useState<Member[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [groupFilter, setGroupFilter] = useState<string>('')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    role: 'PAROISSIEN',
    groupIds: [] as string[],
  })

  const fetchMembers = useCallback(async () => {
    if (!churchId) return
    setLoading(true)
    try {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: '10',
      }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      if (groupFilter) params.groupId = groupFilter

      const data = await api.getMembers(churchId, params)
      const response = data as unknown as MembersResponse
      setMembers(response.members || [])
      setTotal(response.total || 0)
      setTotalPages(response.totalPages || 1)
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }, [churchId, page, search, statusFilter, groupFilter])

  const fetchGroups = useCallback(async () => {
    if (!churchId) return
    try {
      const data = await api.getGroups(churchId)
      const response = data as unknown as { groups: Group[] }
      setGroups(response.groups || [])
    } catch (error) {
      console.error('Error fetching groups:', error)
    }
  }, [churchId])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const sortedMembers = [...members].sort((a, b) => {
    const aVal = a[sortField] || ''
    const bVal = b[sortField] || ''
    const cmp = aVal.localeCompare(bVal)
    return sortOrder === 'asc' ? cmp : -cmp
  })

  const resetForm = () => {
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      role: 'PAROISSIEN',
      groupIds: [],
    })
  }

  const handleAddMember = async () => {
    if (!churchId) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/churches/' + churchId + '/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success('Fidèle ajouté avec succès')
        setAddDialogOpen(false)
        resetForm()
        fetchMembers()
      } else {
        const data = await res.json()
        toast.error(data.message || 'Erreur lors de l\'ajout')
      }
    } catch (error) {
      console.error('Error adding member:', error)
      toast.error('Erreur lors de l\'ajout')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditMember = async () => {
    if (!churchId || !selectedMember) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/churches/' + churchId + '/members/' + selectedMember.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success('Fidèle modifié avec succès')
        setEditDialogOpen(false)
        setSelectedMember(null)
        resetForm()
        fetchMembers()
      } else {
        const data = await res.json()
        toast.error(data.message || 'Erreur lors de la modification')
      }
    } catch (error) {
      console.error('Error editing member:', error)
      toast.error('Erreur lors de la modification')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleStatus = async (member: Member) => {
    if (!churchId) return
    try {
      const res = await fetch('/api/churches/' + churchId + '/members/' + member.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !member.isActive }),
      })
      if (res.ok) {
        toast.success(member.isActive ? 'Fidèle désactivé' : 'Fidèle activé')
        fetchMembers()
      } else {
        toast.error('Erreur lors du changement de statut')
      }
    } catch (error) {
      console.error('Error toggling status:', error)
      toast.error('Erreur lors du changement de statut')
    }
  }

  const openEditDialog = (member: Member) => {
    setSelectedMember(member)
    setForm({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      address: '',
      role: member.role,
      groupIds: member.groupMembers.map((gm) => gm.group.id),
    })
    setEditDialogOpen(true)
  }

  const openViewDialog = (member: Member) => {
    setSelectedMember(member)
    setViewDialogOpen(true)
  }

  const toggleGroupSelection = (groupId: string) => {
    setForm((prev) => ({
      ...prev,
      groupIds: prev.groupIds.includes(groupId)
        ? prev.groupIds.filter((id) => id !== groupId)
        : [...prev.groupIds, groupId],
    }))
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Gestion des Fidèles
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {total} fidèle{total !== 1 ? 's' : ''} enregistré{total !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => { resetForm(); setAddDialogOpen(true) }} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un fidèle
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="inactive">Inactif</SelectItem>
          </SelectContent>
        </Select>
        <Select value={groupFilter} onValueChange={(v) => { setGroupFilter(v === 'all' ? '' : v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Groupe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les groupes</SelectItem>
            {groups.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exporter
        </Button>
      </div>

      {/* Data Table */}
      <div className="rounded-lg border bg-card">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : sortedMembers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">Aucun fidèle trouvé</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search || statusFilter || groupFilter
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Commencez par ajouter votre premier fidèle'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    onClick={() => handleSort('firstName')}
                  >
                    Nom
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    onClick={() => handleSort('email')}
                  >
                    Email
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="hidden md:table-cell">Téléphone</TableHead>
                <TableHead className="hidden lg:table-cell">Groupes</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="hidden sm:table-cell">
                  <button
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    onClick={() => handleSort('createdAt')}
                  >
                    Date inscription
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white ${getAvatarColor(member.firstName)}`}
                      >
                        {getInitials(member.firstName, member.lastName)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ROLE_LABELS[member.role] || member.role}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{member.email}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{member.phone || '—'}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {member.groupMembers.length > 0 ? (
                        member.groupMembers.map((gm) => (
                          <Badge key={gm.group.id} variant="secondary" className="text-xs">
                            {gm.group.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {member.isActive ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                        Actif
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
                        Inactif
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {formatDate(member.createdAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openViewDialog(member)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(member)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(member)}
                          className={member.isActive ? 'text-red-600' : 'text-emerald-600'}
                        >
                          {member.isActive ? (
                            <>
                              <UserX className="h-4 w-4 mr-2" />
                              Désactiver
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activer
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} sur {totalPages} — {total} résultat{total !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4))
              const pageNum = start + i
              if (pageNum > totalPages) return null
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className="w-8"
                >
                  {pageNum}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Add Member Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un fidèle</DialogTitle>
            <DialogDescription>
              Remplissez les informations du nouveau fidèle.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-firstName">Prénom *</Label>
                <Input
                  id="add-firstName"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Prénom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-lastName">Nom *</Label>
                <Input
                  id="add-lastName"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Nom"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email">Email *</Label>
              <Input
                id="add-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@exemple.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-phone">Téléphone</Label>
              <Input
                id="add-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+221 77 000 00 00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-address">Adresse</Label>
              <Textarea
                id="add-address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Adresse complète"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-role">Rôle</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAROISSIEN">Paroissien</SelectItem>
                  <SelectItem value="DIRIGEANT_GROUPE">Dirigeant de groupe</SelectItem>
                  <SelectItem value="ABBE">Abbé</SelectItem>
                  <SelectItem value="ADMIN_PAROISSE">Admin Paroisse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Groupes</Label>
              <div className="max-h-40 overflow-y-auto rounded-md border p-3 space-y-2">
                {groups.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun groupe disponible</p>
                ) : (
                  groups.map((group) => (
                    <div key={group.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`add-group-${group.id}`}
                        checked={form.groupIds.includes(group.id)}
                        onCheckedChange={() => toggleGroupSelection(group.id)}
                      />
                      <label
                        htmlFor={`add-group-${group.id}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {group.name}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleAddMember}
              disabled={submitting || !form.firstName || !form.lastName || !form.email}
            >
              {submitting ? 'Enregistrement...' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le fidèle</DialogTitle>
            <DialogDescription>
              Modifiez les informations du fidèle.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">Prénom *</Label>
                <Input
                  id="edit-firstName"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Nom *</Label>
                <Input
                  id="edit-lastName"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Téléphone</Label>
              <Input
                id="edit-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Adresse</Label>
              <Textarea
                id="edit-address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Rôle</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAROISSIEN">Paroissien</SelectItem>
                  <SelectItem value="DIRIGEANT_GROUPE">Dirigeant de groupe</SelectItem>
                  <SelectItem value="ABBE">Abbé</SelectItem>
                  <SelectItem value="ADMIN_PAROISSE">Admin Paroisse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Groupes</Label>
              <div className="max-h-40 overflow-y-auto rounded-md border p-3 space-y-2">
                {groups.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun groupe disponible</p>
                ) : (
                  groups.map((group) => (
                    <div key={group.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`edit-group-${group.id}`}
                        checked={form.groupIds.includes(group.id)}
                        onCheckedChange={() => toggleGroupSelection(group.id)}
                      />
                      <label
                        htmlFor={`edit-group-${group.id}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {group.name}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleEditMember}
              disabled={submitting || !form.firstName || !form.lastName || !form.email}
            >
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Member Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Détails du fidèle</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white ${getAvatarColor(selectedMember.firstName)}`}
                >
                  {getInitials(selectedMember.firstName, selectedMember.lastName)}
                </div>
                <div>
                  <p className="text-lg font-semibold">
                    {selectedMember.firstName} {selectedMember.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {ROLE_LABELS[selectedMember.role] || selectedMember.role}
                  </p>
                </div>
              </div>
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span>{selectedMember.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Téléphone</span>
                  <span>{selectedMember.phone || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Statut</span>
                  <span>
                    {selectedMember.isActive ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Actif</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 border-red-200">Inactif</Badge>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email vérifié</span>
                  <span>{selectedMember.emailVerified ? 'Oui' : 'Non'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Inscription</span>
                  <span>{formatDate(selectedMember.createdAt)}</span>
                </div>
                {selectedMember.groupMembers.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Groupes</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedMember.groupMembers.map((gm) => (
                        <Badge key={gm.group.id} variant="secondary">
                          {gm.group.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
