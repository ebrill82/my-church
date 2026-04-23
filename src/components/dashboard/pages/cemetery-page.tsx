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
  Cross,
  Plus,
  Search,
  Crown,
  AlertTriangle,
  MapPin,
  Eye,
  User,
  Calendar,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

// ─── Types ──────────────────────────────────────────────────────────────────

interface Concession {
  id: string
  plotNumber: string | null
  location: string | null
  startDate: string
  endDate: string
  duration: string | null
  status: string
  notes: string | null
  owner?: {
    id: string
    firstName: string
    lastName: string
  }
  defunts?: Defunt[]
}

interface Defunt {
  id: string
  firstName: string
  lastName: string
  birthDate: string | null
  deathDate: string | null
  burialDate: string | null
  notes: string | null
  concession?: {
    id: string
    plotNumber: string | null
  }
}

// ─── Constants ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Active', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  EXPIRED: { label: 'Expirée', color: 'bg-red-100 text-red-700 border-red-200' },
  TRANSFERRED: { label: 'Transférée', color: 'bg-amber-100 text-amber-700 border-amber-200' },
}

const PLOT_STATUS_COLORS: Record<string, string> = {
  available: 'bg-emerald-200 dark:bg-emerald-800 hover:bg-emerald-300 dark:hover:bg-emerald-700',
  active: 'bg-blue-200 dark:bg-blue-800 hover:bg-blue-300 dark:hover:bg-blue-700',
  expired: 'bg-red-200 dark:bg-red-800 hover:bg-red-300 dark:hover:bg-red-700',
}

// Demo data for the cemetery grid
const DEMO_PLOTS = [
  { id: 'A1', section: 'A', status: 'active', owner: 'Diouf' },
  { id: 'A2', section: 'A', status: 'available', owner: '' },
  { id: 'A3', section: 'A', status: 'active', owner: 'Sow' },
  { id: 'A4', section: 'A', status: 'expired', owner: 'Ba' },
  { id: 'A5', section: 'A', status: 'available', owner: '' },
  { id: 'A6', section: 'A', status: 'active', owner: 'Ndiaye' },
  { id: 'B1', section: 'B', status: 'available', owner: '' },
  { id: 'B2', section: 'B', status: 'active', owner: 'Fall' },
  { id: 'B3', section: 'B', status: 'active', owner: 'Sy' },
  { id: 'B4', section: 'B', status: 'available', owner: '' },
  { id: 'B5', section: 'B', status: 'expired', owner: 'Diallo' },
  { id: 'B6', section: 'B', status: 'active', owner: 'Mbaye' },
  { id: 'C1', section: 'C', status: 'active', owner: 'Gueye' },
  { id: 'C2', section: 'C', status: 'available', owner: '' },
  { id: 'C3', section: 'C', status: 'active', owner: 'Thiam' },
  { id: 'C4', section: 'C', status: 'available', owner: '' },
  { id: 'C5', section: 'C', status: 'active', owner: 'Faye' },
  { id: 'C6', section: 'C', status: 'expired', owner: 'Sarr' },
]

// ─── Component ──────────────────────────────────────────────────────────────

export default function CemeteryPage() {
  const { church } = useAppStore()
  const churchId = church?.id

  const [concessions, setConcessions] = useState<Concession[]>([])
  const [defunts, setDefunts] = useState<Defunt[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlot, setSelectedPlot] = useState<string | null>(null)

  // New concession dialog
  const [newConcessionOpen, setNewConcessionOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [concessionForm, setConcessionForm] = useState({
    plotNumber: '',
    location: '',
    ownerId: '',
    startDate: '',
    endDate: '',
    duration: '',
    notes: '',
  })

  // Search
  const [searchQuery, setSearchQuery] = useState('')

  // Defunt detail dialog
  const [defuntDetailOpen, setDefuntDetailOpen] = useState(false)
  const [selectedDefunt, setSelectedDefunt] = useState<Defunt | null>(null)

  const isPremium = church?.plan === 'PREMIUM' || church?.plan === 'DIOCESE'

  // ─── Fetch data ───────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!churchId) { setLoading(false); return }
    setLoading(true)
    try {
      const [concessionsRes, defuntsRes] = await Promise.all([
        fetch(`/api/cemetery/concessions?churchId=${churchId}`),
        fetch(`/api/cemetery/defunts?churchId=${churchId}`),
      ])
      if (concessionsRes.ok) {
        const data = await concessionsRes.json()
        setConcessions(data.concessions || [])
      }
      if (defuntsRes.ok) {
        const data = await defuntsRes.json()
        setDefunts(data.defunts || [])
      }
    } catch (error) {
      console.error('Error fetching cemetery data:', error)
    } finally {
      setLoading(false)
    }
  }, [churchId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ─── Computed ─────────────────────────────────────────────────────────
  const expiringConcessions = concessions.filter((c) => {
    if (c.status !== 'ACTIVE' || !c.endDate) return false
    const end = new Date(c.endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000 // Within 30 days
  })

  const filteredDefunts = defunts.filter((d) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      d.firstName.toLowerCase().includes(q) ||
      d.lastName.toLowerCase().includes(q) ||
      (d.concession?.plotNumber || '').toLowerCase().includes(q)
    )
  })

  // ─── Handlers ─────────────────────────────────────────────────────────
  const handleCreateConcession = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/cemetery/concessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          churchId,
          ...concessionForm,
        }),
      })
      if (res.ok) {
        toast.success('Concession créée')
        setNewConcessionOpen(false)
        setConcessionForm({ plotNumber: '', location: '', ownerId: '', startDate: '', endDate: '', duration: '', notes: '' })
        fetchData()
      } else {
        toast.error('Erreur lors de la création')
      }
    } catch (error) {
      console.error('Error creating concession:', error)
      toast.error('Erreur lors de la création')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
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

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Premium Banner */}
      {!isPremium && (
        <Card className="border-[#C9A84C]/30 bg-[#C9A84C]/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A84C]/20">
              <Crown className="h-5 w-5 text-[#C9A84C]" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Fonctionnalité Premium</p>
              <p className="text-xs text-muted-foreground">
                La gestion du cimetière est disponible à partir du plan Premium
              </p>
            </div>
            <Button size="sm" className="bg-[#C9A84C] text-[#1B3A5C] hover:bg-[#C9A84C]/90">
              Passer à Premium
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Cross className="h-6 w-6 text-primary" />
            Cimetière
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {concessions.length} concession{concessions.length !== 1 ? 's' : ''} • {defunts.length} défunt{defunts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setNewConcessionOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle concession
        </Button>
      </div>

      {/* Expiring concessions alert */}
      {expiringConcessions.length > 0 && (
        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-sm text-amber-800 dark:text-amber-200">
                {expiringConcessions.length} concession{expiringConcessions.length > 1 ? 's' : ''} expire{expiringConcessions.length > 1 ? 'nt' : ''} bientôt
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Ces concessions arrivent à expiration dans les 30 prochains jours. Pensez à contacter les propriétaires.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="plan" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plan" className="gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            Plan interactif
          </TabsTrigger>
          <TabsTrigger value="concessions" className="gap-1.5">
            <Cross className="h-3.5 w-3.5" />
            Concessions
          </TabsTrigger>
          <TabsTrigger value="search" className="gap-1.5">
            <Search className="h-3.5 w-3.5" />
            Recherche défunts
          </TabsTrigger>
        </TabsList>

        {/* ─── Plan interactif Tab ──────────────────────────────────────── */}
        <TabsContent value="plan" className="space-y-4">
          {/* Legend */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-emerald-200 dark:bg-emerald-800" />
              <span className="text-muted-foreground">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-blue-200 dark:bg-blue-800" />
              <span className="text-muted-foreground">Concession active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-red-200 dark:bg-red-800" />
              <span className="text-muted-foreground">Expirée</span>
            </div>
          </div>

          {/* Cemetery grid */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                {['A', 'B', 'C'].map((section) => (
                  <div key={section}>
                    <h3 className="text-sm font-semibold mb-2">Section {section}</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {DEMO_PLOTS.filter((p) => p.section === section).map((plot) => (
                        <button
                          key={plot.id}
                          onClick={() => setSelectedPlot(selectedPlot === plot.id ? null : plot.id)}
                          className={`
                            relative rounded-lg p-3 text-center transition-all border
                            ${PLOT_STATUS_COLORS[plot.status]}
                            ${selectedPlot === plot.id ? 'ring-2 ring-primary ring-offset-2' : ''}
                          `}
                        >
                          <span className="text-xs font-bold block">{plot.id}</span>
                          {plot.owner && (
                            <span className="text-[10px] text-muted-foreground block truncate">{plot.owner}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected plot details */}
          {selectedPlot && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Parcelle {selectedPlot}</p>
                    <p className="text-sm text-muted-foreground">
                      {DEMO_PLOTS.find((p) => p.id === selectedPlot)?.status === 'available'
                        ? 'Cette parcelle est disponible'
                        : `Propriétaire: ${DEMO_PLOTS.find((p) => p.id === selectedPlot)?.owner || 'Inconnu'}`
                      }
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={STATUS_CONFIG[DEMO_PLOTS.find((p) => p.id === selectedPlot)?.status?.toUpperCase() || 'ACTIVE']?.color || STATUS_CONFIG.ACTIVE.color}
                  >
                    {DEMO_PLOTS.find((p) => p.id === selectedPlot)?.status === 'available'
                      ? 'Disponible'
                      : STATUS_CONFIG[DEMO_PLOTS.find((p) => p.id === selectedPlot)?.status?.toUpperCase() || 'ACTIVE']?.label || 'Active'
                    }
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ─── Concessions Tab ──────────────────────────────────────────── */}
        <TabsContent value="concessions" className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : concessions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <Cross className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="text-lg font-medium">Aucune concession</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Créez votre première concession de cimetière
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Parcelle</TableHead>
                    <TableHead>Propriétaire</TableHead>
                    <TableHead className="hidden md:table-cell">Section</TableHead>
                    <TableHead className="hidden sm:table-cell">Début</TableHead>
                    <TableHead className="hidden sm:table-cell">Fin</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {concessions.map((concession) => {
                    const statusConfig = STATUS_CONFIG[concession.status] || STATUS_CONFIG.ACTIVE
                    return (
                      <TableRow key={concession.id}>
                        <TableCell className="font-medium">
                          {concession.plotNumber || concession.id.slice(-6)}
                        </TableCell>
                        <TableCell>
                          {concession.owner
                            ? `${concession.owner.firstName} ${concession.owner.lastName}`
                            : '—'
                          }
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {concession.location || '—'}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(concession.startDate)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(concession.endDate)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${statusConfig.color}`}>
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* ─── Recherche défunts Tab ────────────────────────────────────── */}
        <TabsContent value="search" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou numéro de parcelle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredDefunts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <User className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="text-lg font-medium">
                  {searchQuery ? 'Aucun défunt trouvé' : 'Aucun défunt enregistré'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery ? 'Essayez de modifier votre recherche' : 'Les défunts apparaîtront ici une fois ajoutés aux concessions'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prénom</TableHead>
                    <TableHead className="hidden md:table-cell">Date naissance</TableHead>
                    <TableHead className="hidden sm:table-cell">Date décès</TableHead>
                    <TableHead className="hidden lg:table-cell">Date inhumation</TableHead>
                    <TableHead>Concession</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDefunts.map((defunt) => (
                    <TableRow key={defunt.id}>
                      <TableCell className="font-medium">{defunt.lastName}</TableCell>
                      <TableCell>{defunt.firstName}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {formatDate(defunt.birthDate)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {formatDate(defunt.deathDate)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {formatDate(defunt.burialDate)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {defunt.concession?.plotNumber || '—'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setSelectedDefunt(defunt)
                            setDefuntDetailOpen(true)
                          }}
                        >
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
      </Tabs>

      {/* ─── New Concession Dialog ──────────────────────────────────────── */}
      <Dialog open={newConcessionOpen} onOpenChange={setNewConcessionOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle concession</DialogTitle>
            <DialogDescription>
              Enregistrez une nouvelle concession de cimetière
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plot-number">N° Parcelle *</Label>
                <Input
                  id="plot-number"
                  value={concessionForm.plotNumber}
                  onChange={(e) => setConcessionForm({ ...concessionForm, plotNumber: e.target.value })}
                  placeholder="A-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plot-location">Section / Emplacement</Label>
                <Input
                  id="plot-location"
                  value={concessionForm.location}
                  onChange={(e) => setConcessionForm({ ...concessionForm, location: e.target.value })}
                  placeholder="Section A, Rangée 1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Date de début *</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={concessionForm.startDate}
                  onChange={(e) => setConcessionForm({ ...concessionForm, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">Date de fin *</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={concessionForm.endDate}
                  onChange={(e) => setConcessionForm({ ...concessionForm, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Durée</Label>
              <Input
                id="duration"
                value={concessionForm.duration}
                onChange={(e) => setConcessionForm({ ...concessionForm, duration: e.target.value })}
                placeholder="10 ans, 30 ans, perpétuelle..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="concession-notes">Notes</Label>
              <Textarea
                id="concession-notes"
                value={concessionForm.notes}
                onChange={(e) => setConcessionForm({ ...concessionForm, notes: e.target.value })}
                placeholder="Notes complémentaires"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewConcessionOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleCreateConcession}
              disabled={submitting || !concessionForm.plotNumber || !concessionForm.startDate || !concessionForm.endDate}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {submitting ? 'Création...' : 'Créer la concession'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Defunt Detail Dialog ────────────────────────────────────────── */}
      <Dialog open={defuntDetailOpen} onOpenChange={setDefuntDetailOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Détails du défunt</DialogTitle>
          </DialogHeader>
          {selectedDefunt && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold">
                    {selectedDefunt.firstName} {selectedDefunt.lastName}
                  </p>
                  {selectedDefunt.concession?.plotNumber && (
                    <p className="text-sm text-muted-foreground">
                      Parcelle {selectedDefunt.concession.plotNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Naissance:</span>
                  <span>{formatDate(selectedDefunt.birthDate)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Cross className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Décès:</span>
                  <span>{formatDate(selectedDefunt.deathDate)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Inhumation:</span>
                  <span>{formatDate(selectedDefunt.burialDate)}</span>
                </div>
                {selectedDefunt.notes && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p className="text-sm mt-1">{selectedDefunt.notes}</p>
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
