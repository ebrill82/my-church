'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  FileText,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Droplets,
  Heart,
  Gem,
  FileQuestion,
  ChevronLeft,
  ChevronRight,
  Loader2,
  UserCircle,
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Types ──────────────────────────────────────────────────────

interface CertificateUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface ApprovedByUser {
  id: string
  firstName: string
  lastName: string
}

interface Certificate {
  id: string
  type: string
  details: string
  status: string
  pdfUrl: string | null
  rejectionReason: string | null
  fee: number
  feePaid: boolean
  createdAt: string
  updatedAt: string
  user: CertificateUser
  approvedBy: ApprovedByUser | null
}

// ─── Config Maps ────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  BAPTISM: 'Baptême',
  CONFIRMATION: 'Confirmation',
  MARRIAGE: 'Mariage',
  OTHER: 'Autre',
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  BAPTISM: Droplets,
  CONFIRMATION: Gem,
  MARRIAGE: Heart,
  OTHER: FileQuestion,
}

const TYPE_COLORS: Record<string, string> = {
  BAPTISM: 'bg-blue-100 text-blue-700 border-blue-200',
  CONFIRMATION: 'bg-purple-100 text-purple-700 border-purple-200',
  MARRIAGE: 'bg-rose-100 text-rose-700 border-rose-200',
  OTHER: 'bg-gray-100 text-gray-700 border-gray-200',
}

const STATUS_LABELS: Record<string, string> = {
  DEMANDED: 'Demandé',
  VERIFIED: 'Vérifié',
  APPROVED: 'Approuvé',
  REJECTED: 'Rejeté',
  DELIVERED: 'Délivré',
}

const STATUS_COLORS: Record<string, string> = {
  DEMANDED: 'bg-blue-100 text-blue-700 border-blue-200',
  VERIFIED: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
  DELIVERED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

// ─── Helpers ────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
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

function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

function parseDetails(detailsStr: string): Record<string, unknown> {
  try {
    return JSON.parse(detailsStr)
  } catch {
    return {}
  }
}

function formatXOF(amount: number): string {
  return amount.toLocaleString('fr-FR') + ' XOF'
}

// ─── Skeletons ──────────────────────────────────────────────────

function CertificateSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-64" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function CertificatesPage() {
  const { churchId, user } = useAppStore()

  // ─── Certificate state ─────────────────────────────────────
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 8

  // ─── Dialog states ─────────────────────────────────────────
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectingCertId, setRejectingCertId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // ─── Certificate request form ──────────────────────────────
  const [certType, setCertType] = useState<string>('BAPTISM')
  const [certDetails, setCertDetails] = useState<Record<string, string>>({})
  const [certNotes, setCertNotes] = useState('')

  const resetCertForm = () => {
    setCertType('BAPTISM')
    setCertDetails({})
    setCertNotes('')
  }

  // ─── Fetch certificates ────────────────────────────────────
  const fetchCertificates = useCallback(async () => {
    if (!churchId) return
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (typeFilter) params.type = typeFilter
      if (statusFilter) params.status = statusFilter
      const data = await api.getCertificates(churchId) as unknown as {
        certificates: Certificate[]
      }
      setCertificates(data.certificates || [])
    } catch (error) {
      console.error('Error fetching certificates:', error)
    } finally {
      setLoading(false)
    }
  }, [churchId, typeFilter, statusFilter])

  useEffect(() => {
    fetchCertificates()
  }, [fetchCertificates])

  // ─── Derived data ──────────────────────────────────────────
  const pendingCerts = certificates.filter(c =>
    c.status === 'DEMANDED' || c.status === 'VERIFIED'
  )

  const issuedCerts = certificates.filter(c => c.status === 'DELIVERED')

  const filteredCertificates = certificates.filter(c => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const name = `${c.user.firstName} ${c.user.lastName}`.toLowerCase()
      if (!name.includes(q)) return false
    }
    if (typeFilter && c.type !== typeFilter) return false
    if (statusFilter && c.status !== statusFilter) return false
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filteredCertificates.length / pageSize))
  const paginatedCerts = filteredCertificates.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  // ─── Handlers ──────────────────────────────────────────────
  const handleApprove = async (certId: string) => {
    try {
      const res = await fetch(`/api/certificates/${certId}?XTransformPort=3000`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          approvedById: user?.id,
        }),
      })
      if (!res.ok) throw new Error('Erreur')
      toast.success('Certificat approuvé avec succès')
      fetchCertificates()
    } catch {
      toast.error("Erreur lors de l'approbation")
    }
  }

  const handleReject = async () => {
    if (!rejectingCertId) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/certificates/${rejectingCertId}?XTransformPort=3000`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          reason: rejectionReason,
        }),
      })
      if (!res.ok) throw new Error('Erreur')
      toast.success('Certificat rejeté')
      setRejectDialogOpen(false)
      setRejectingCertId(null)
      setRejectionReason('')
      fetchCertificates()
    } catch {
      toast.error('Erreur lors du rejet')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRequestCertificate = async () => {
    if (!churchId || !user?.id) return
    setSubmitting(true)
    try {
      await api.createCertificate({
        churchId,
        userId: user.id,
        type: certType,
        details: certDetails,
        fee: 5000,
      })
      setRequestDialogOpen(false)
      resetCertForm()
      fetchCertificates()
      toast.success('Demande de certificat envoyée')
    } catch {
      toast.error('Erreur lors de la demande')
    } finally {
      setSubmitting(false)
    }
  }

  const openRejectDialog = (certId: string) => {
    setRejectingCertId(certId)
    setRejectionReason('')
    setRejectDialogOpen(true)
  }

  // ─── Dynamic form fields based on cert type ────────────────
  const renderDynamicFields = () => {
    switch (certType) {
      case 'BAPTISM':
        return (
          <>
            <div className="space-y-2">
              <Label>Date du baptême</Label>
              <Input
                type="date"
                value={certDetails.date || ''}
                onChange={(e) => setCertDetails({ ...certDetails, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Lieu du baptême</Label>
              <Input
                value={certDetails.lieu || ''}
                onChange={(e) => setCertDetails({ ...certDetails, lieu: e.target.value })}
                placeholder="Église, ville..."
              />
            </div>
            <div className="space-y-2">
              <Label>Noms des parents</Label>
              <Input
                value={certDetails.nomsParents || ''}
                onChange={(e) => setCertDetails({ ...certDetails, nomsParents: e.target.value })}
                placeholder="Noms du père et de la mère"
              />
            </div>
            <div className="space-y-2">
              <Label>Noms parrain/marraine</Label>
              <Input
                value={certDetails.nomsParrainMarraine || ''}
                onChange={(e) => setCertDetails({ ...certDetails, nomsParrainMarraine: e.target.value })}
                placeholder="Noms du parrain et/ou de la marraine"
              />
            </div>
          </>
        )
      case 'CONFIRMATION':
        return (
          <>
            <div className="space-y-2">
              <Label>Date de confirmation</Label>
              <Input
                type="date"
                value={certDetails.date || ''}
                onChange={(e) => setCertDetails({ ...certDetails, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Lieu de confirmation</Label>
              <Input
                value={certDetails.lieu || ''}
                onChange={(e) => setCertDetails({ ...certDetails, lieu: e.target.value })}
                placeholder="Église, ville..."
              />
            </div>
            <div className="space-y-2">
              <Label>Noms parrain/marraine</Label>
              <Input
                value={certDetails.nomsParrainMarraine || ''}
                onChange={(e) => setCertDetails({ ...certDetails, nomsParrainMarraine: e.target.value })}
                placeholder="Noms du parrain et/ou de la marraine"
              />
            </div>
            <div className="space-y-2">
              <Label>Évêque</Label>
              <Input
                value={certDetails.eveque || ''}
                onChange={(e) => setCertDetails({ ...certDetails, eveque: e.target.value })}
                placeholder="Nom de l'évêque"
              />
            </div>
          </>
        )
      case 'MARRIAGE':
        return (
          <>
            <div className="space-y-2">
              <Label>Date du mariage</Label>
              <Input
                type="date"
                value={certDetails.date || ''}
                onChange={(e) => setCertDetails({ ...certDetails, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Lieu du mariage</Label>
              <Input
                value={certDetails.lieu || ''}
                onChange={(e) => setCertDetails({ ...certDetails, lieu: e.target.value })}
                placeholder="Église, ville..."
              />
            </div>
            <div className="space-y-2">
              <Label>Nom du conjoint</Label>
              <Input
                value={certDetails.nomConjoint || ''}
                onChange={(e) => setCertDetails({ ...certDetails, nomConjoint: e.target.value })}
                placeholder="Nom complet du conjoint"
              />
            </div>
            <div className="space-y-2">
              <Label>Noms des témoins</Label>
              <Input
                value={certDetails.nomsTemoins || ''}
                onChange={(e) => setCertDetails({ ...certDetails, nomsTemoins: e.target.value })}
                placeholder="Noms des témoins séparés par des virgules"
              />
            </div>
          </>
        )
      case 'OTHER':
        return (
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={certDetails.description || ''}
              onChange={(e) => setCertDetails({ ...certDetails, description: e.target.value })}
              placeholder="Décrivez le certificat souhaité..."
              rows={4}
            />
          </div>
        )
      default:
        return null
    }
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Certificats
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gérez les demandes et délivrance de certificats paroissiaux
          </p>
        </div>
        <Button
          onClick={() => { resetCertForm(); setRequestDialogOpen(true) }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Demander un certificat
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Demandes en attente</span>
            <span className="sm:hidden">En attente</span>
            {pendingCerts.length > 0 && (
              <Badge className="ml-1 text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 border-amber-200">
                {pendingCerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="issued" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span className="hidden sm:inline">Certificats émis</span>
            <span className="sm:hidden">Émis</span>
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            <FileText className="h-4 w-4" />
            Tous
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════════════
            PENDING TAB
            ═══════════════════════════════════════════════════════ */}
        <TabsContent value="pending" className="space-y-6">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <CertificateSkeleton />
              <CertificateSkeleton />
              <CertificateSkeleton />
              <CertificateSkeleton />
            </div>
          ) : pendingCerts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">Aucune demande en attente</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Toutes les demandes ont été traitées
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {pendingCerts.map((cert) => {
                const TypeIcon = TYPE_ICONS[cert.type] || FileQuestion
                const details = parseDetails(cert.details)

                return (
                  <Card key={cert.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${TYPE_COLORS[cert.type] || ''}`}>
                          <TypeIcon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm">
                              {cert.user.firstName} {cert.user.lastName}
                            </h3>
                            <Badge className={STATUS_COLORS[cert.status]} variant="outline">
                              {STATUS_LABELS[cert.status]}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {TYPE_LABELS[cert.type]} — Demandé le {formatDate(cert.createdAt)}
                          </p>
                          {/* Details preview */}
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            {details.date && <p>Date : {details.date}</p>}
                            {details.lieu && <p>Lieu : {details.lieu}</p>}
                            {details.nomsParents && <p>Parents : {details.nomsParents}</p>}
                            {details.nomConjoint && <p>Conjoint : {details.nomConjoint}</p>}
                            {details.nomsParrainMarraine && <p>Parrain/Marraine : {details.nomsParrainMarraine}</p>}
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-2 mt-3">
                            <Button
                              size="sm"
                              className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handleApprove(cert.id)}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Approuver
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => openRejectDialog(cert.id)}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Rejeter
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════
            ISSUED TAB
            ═══════════════════════════════════════════════════════ */}
        <TabsContent value="issued" className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : issuedCerts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">Aucun certificat émis</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Les certificats approuvés apparaîtront ici
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N°</TableHead>
                    <TableHead>Demandeur</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden sm:table-cell">Date émission</TableHead>
                    <TableHead className="hidden md:table-cell">Approuvé par</TableHead>
                    <TableHead>PDF</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issuedCerts.map((cert, idx) => (
                    <TableRow key={cert.id}>
                      <TableCell className="text-sm font-mono">
                        #{(idx + 1).toString().padStart(3, '0')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                            {cert.user.firstName.charAt(0)}{cert.user.lastName.charAt(0)}
                          </div>
                          <span className="text-sm font-medium">
                            {cert.user.firstName} {cert.user.lastName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={TYPE_COLORS[cert.type]} variant="outline">
                          {TYPE_LABELS[cert.type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {formatDate(cert.updatedAt)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {cert.approvedBy
                          ? `${cert.approvedBy.firstName} ${cert.approvedBy.lastName}`
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="gap-1 h-8">
                          <Download className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">PDF</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════
            ALL TAB
            ═══════════════════════════════════════════════════════ */}
        <TabsContent value="all" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par demandeur..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v === 'all' ? '' : v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="BAPTISM">Baptême</SelectItem>
                <SelectItem value="CONFIRMATION">Confirmation</SelectItem>
                <SelectItem value="MARRIAGE">Mariage</SelectItem>
                <SelectItem value="OTHER">Autre</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="DEMANDED">Demandé</SelectItem>
                <SelectItem value="VERIFIED">Vérifié</SelectItem>
                <SelectItem value="APPROVED">Approuvé</SelectItem>
                <SelectItem value="REJECTED">Rejeté</SelectItem>
                <SelectItem value="DELIVERED">Délivré</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-lg border bg-card">
            {loading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            ) : paginatedCerts.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">Aucun certificat trouvé</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Modifiez vos filtres pour voir plus de résultats
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Demandeur</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="hidden lg:table-cell">Frais</TableHead>
                    <TableHead className="hidden lg:table-cell">Approuvé par</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCerts.map((cert) => {
                    const TypeIcon = TYPE_ICONS[cert.type] || FileQuestion
                    return (
                      <TableRow key={cert.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                              {cert.user.firstName.charAt(0)}{cert.user.lastName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {cert.user.firstName} {cert.user.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">{cert.user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TypeIcon className="h-4 w-4 text-muted-foreground" />
                            <Badge className={TYPE_COLORS[cert.type]} variant="outline">
                              {TYPE_LABELS[cert.type]}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {formatDate(cert.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[cert.status]} variant="outline">
                            {STATUS_LABELS[cert.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">
                          {cert.feePaid ? (
                            <span className="text-emerald-600">{formatXOF(cert.fee)}</span>
                          ) : (
                            <span className="text-muted-foreground">{formatXOF(cert.fee)} (impayé)</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {cert.approvedBy
                            ? `${cert.approvedBy.firstName} ${cert.approvedBy.lastName}`
                            : '—'}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} sur {totalPages} — {filteredCertificates.length} résultat{filteredCertificates.length !== 1 ? 's' : ''}
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
        </TabsContent>
      </Tabs>

      {/* ═══════════════════════════════════════════════════════
          REQUEST CERTIFICATE DIALOG
          ═══════════════════════════════════════════════════════ */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Demander un certificat
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations pour votre demande de certificat.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Type de certificat</Label>
              <Select value={certType} onValueChange={(v) => { setCertType(v); setCertDetails({}) }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BAPTISM">
                    <span className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      Baptême
                    </span>
                  </SelectItem>
                  <SelectItem value="CONFIRMATION">
                    <span className="flex items-center gap-2">
                      <Gem className="h-4 w-4 text-purple-500" />
                      Confirmation
                    </span>
                  </SelectItem>
                  <SelectItem value="MARRIAGE">
                    <span className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-rose-500" />
                      Mariage
                    </span>
                  </SelectItem>
                  <SelectItem value="OTHER">
                    <span className="flex items-center gap-2">
                      <FileQuestion className="h-4 w-4 text-gray-500" />
                      Autre
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dynamic fields */}
            {renderDynamicFields()}

            <div className="space-y-2">
              <Label>Notes supplémentaires</Label>
              <Textarea
                value={certNotes}
                onChange={(e) => setCertNotes(e.target.value)}
                placeholder="Informations complémentaires..."
                rows={3}
              />
            </div>

            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Frais de certificat</span>
                <span className="font-semibold">5 000 XOF</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleRequestCertificate}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                'Envoyer la demande'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════
          REJECT CERTIFICATE DIALOG
          ═══════════════════════════════════════════════════════ */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Rejeter le certificat
            </DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison du rejet de cette demande.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reject-reason">Raison du rejet</Label>
            <Textarea
              id="reject-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Expliquez pourquoi cette demande est rejetée..."
              rows={4}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={submitting || !rejectionReason}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejet en cours...
                </>
              ) : (
                'Confirmer le rejet'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
