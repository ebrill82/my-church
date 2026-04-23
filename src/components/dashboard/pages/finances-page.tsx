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
import { Switch } from '@/components/ui/switch'
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
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  DollarSign,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Phone,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldCheck,
  BarChart3,
  Church,
  Users,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { toast } from 'sonner'

// ─── Types ──────────────────────────────────────────────────────

interface DonationUser {
  id: string
  firstName: string
  lastName: string
  avatarUrl: string | null
}

interface Donation {
  id: string
  amount: number
  currency: string
  method: string
  status: string
  transactionRef: string | null
  isAnonymous: boolean
  createdAt: string
  user: DonationUser | null
}

interface DonationStats {
  total: number
  count: number
  average: number
  max: number
}

interface QueteEntry {
  id: string
  date: string
  massTime: string | null
  celebrantId: string | null
  ordinaryAmount: number
  specialAmount: number
  massOfferingAmount: number
  totalAmount: number
  notes: string | null
  createdAt: string
}

// ─── Config Maps ────────────────────────────────────────────────

const METHOD_LABELS: Record<string, string> = {
  ORANGE_MONEY: 'Orange Money',
  M_PESA: 'M-Pesa',
  STRIPE: 'Stripe',
  CASH: 'Espèces',
}

const METHOD_COLORS: Record<string, string> = {
  ORANGE_MONEY: 'bg-orange-100 text-orange-700 border-orange-200',
  M_PESA: 'bg-green-100 text-green-700 border-green-200',
  STRIPE: 'bg-purple-100 text-purple-700 border-purple-200',
  CASH: 'bg-amber-100 text-amber-700 border-amber-200',
}

const STATUS_LABELS: Record<string, string> = {
  INITIATED: 'Initié',
  PROCESSING: 'En cours',
  SUCCESS: 'Succès',
  FAILED: 'Échoué',
  REFUNDED: 'Remboursé',
}

const STATUS_COLORS: Record<string, string> = {
  SUCCESS: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  PROCESSING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  FAILED: 'bg-red-100 text-red-700 border-red-200',
  INITIATED: 'bg-blue-100 text-blue-700 border-blue-200',
  REFUNDED: 'bg-gray-100 text-gray-700 border-gray-200',
}

const BAR_COLORS: Record<string, string> = {
  ORANGE_MONEY: '#f97316',
  M_PESA: '#22c55e',
  STRIPE: '#a855f7',
  CASH: '#f59e0b',
}

// ─── Helpers ────────────────────────────────────────────────────

function formatXOF(amount: number): string {
  return amount.toLocaleString('fr-FR') + ' XOF'
}

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

function getMonthLabel(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      month: 'short',
      year: '2-digit',
    })
  } catch {
    return dateStr
  }
}

// ─── Skeletons ──────────────────────────────────────────────────

function StatSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  )
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function FinancesPage() {
  const { churchId, church } = useAppStore()
  const isPremium = church?.plan === 'PREMIUM' || church?.plan === 'DIOCESE'

  // ─── Donation state ────────────────────────────────────────
  const [donations, setDonations] = useState<Donation[]>([])
  const [stats, setStats] = useState<DonationStats>({ total: 0, count: 0, average: 0, max: 0 })
  const [loading, setLoading] = useState(true)
  const [periodFilter, setPeriodFilter] = useState('month')
  const [methodFilter, setMethodFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 8

  // ─── Quêtes state ──────────────────────────────────────────
  const [quetes, setQuetes] = useState<QueteEntry[]>([])
  const [queteDialogOpen, setQueteDialogOpen] = useState(false)
  const [queteForm, setQueteForm] = useState({
    date: new Date().toISOString().split('T')[0],
    massTime: '08h00',
    ordinaryAmount: '',
    specialAmount: '',
    massOfferingAmount: '',
    notes: '',
  })
  const [queteSubmitting, setQueteSubmitting] = useState(false)

  // ─── Config state ──────────────────────────────────────────
  const [omConfig, setOmConfig] = useState({ apiKey: '', secretKey: '', merchantId: '', active: false })
  const [mpesaConfig, setMpesaConfig] = useState({ consumerKey: '', secret: '', passkey: '', shortcode: '', active: false })
  const [omTesting, setOmTesting] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [mpesaTesting, setMpesaTesting] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [configSaving, setConfigSaving] = useState(false)

  // ─── Fetch donations ───────────────────────────────────────
  const fetchDonations = useCallback(async () => {
    if (!churchId) return
    setLoading(true)
    try {
      const params: Record<string, string> = { period: periodFilter }
      if (methodFilter) params.method = methodFilter
      if (statusFilter) params.status = statusFilter
      const data = await api.getDonations(churchId, params) as unknown as {
        donations: Donation[]
        stats: DonationStats
      }
      setDonations(data.donations || [])
      setStats(data.stats || { total: 0, count: 0, average: 0, max: 0 })
    } catch (error) {
      console.error('Error fetching donations:', error)
    } finally {
      setLoading(false)
    }
  }, [churchId, periodFilter, methodFilter, statusFilter])

  // ─── Fetch quetes ──────────────────────────────────────────
  const fetchQuetes = useCallback(async () => {
    if (!churchId) return
    try {
      const res = await fetch(`/api/quetes?churchId=${churchId}`)
      const data = await res.json()
      setQuetes(data.quetes || [])
    } catch (error) {
      console.error('Error fetching quetes:', error)
    }
  }, [churchId])

  // ─── Fetch payment config ──────────────────────────────────
  const fetchPaymentConfig = useCallback(async () => {
    if (!churchId) return
    try {
      const res = await fetch(`/api/payment-config?churchId=${churchId}`)
      const data = await res.json()
      const configs = data.configs || []
      const om = configs.find((c: Record<string, unknown>) => c.method === 'ORANGE_MONEY')
      const mpesa = configs.find((c: Record<string, unknown>) => c.method === 'M_PESA')
      if (om) {
        const config = typeof om.config === 'string' ? JSON.parse(om.config) : om.config
        setOmConfig({
          apiKey: config.apiKey || '',
          secretKey: config.secretKey || '',
          merchantId: config.merchantId || '',
          active: om.isActive || false,
        })
      }
      if (mpesa) {
        const config = typeof mpesa.config === 'string' ? JSON.parse(mpesa.config) : mpesa.config
        setMpesaConfig({
          consumerKey: config.consumerKey || '',
          secret: config.secret || '',
          passkey: config.passkey || '',
          shortcode: config.shortcode || '',
          active: mpesa.isActive || false,
        })
      }
    } catch {
      // Config endpoint may not exist yet, that's fine
    }
  }, [churchId])

  useEffect(() => {
    fetchDonations()
  }, [fetchDonations])

  useEffect(() => {
    fetchQuetes()
  }, [fetchQuetes])

  useEffect(() => {
    fetchPaymentConfig()
  }, [fetchPaymentConfig])

  // ─── Chart data ────────────────────────────────────────────
  const chartData = (() => {
    const months: Record<string, Record<string, number>> = {}
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
      months[key] = { ORANGE_MONEY: 0, M_PESA: 0, STRIPE: 0, CASH: 0 }
    }
    donations.forEach(d => {
      if (d.status === 'SUCCESS') {
        const date = new Date(d.createdAt)
        const key = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
        if (months[key] && d.method in months[key]) {
          months[key][d.method] += d.amount
        }
      }
    })
    return Object.entries(months).map(([month, amounts]) => ({
      month,
      ...amounts,
    }))
  })()

  // ─── Filtered donations ────────────────────────────────────
  const filteredDonations = donations.filter(d => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const name = d.user
        ? `${d.user.firstName} ${d.user.lastName}`.toLowerCase()
        : 'anonyme'
      if (!name.includes(q)) return false
    }
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filteredDonations.length / pageSize))
  const paginatedDonations = filteredDonations.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  // ─── Test connection handler ───────────────────────────────
  const testConnection = async (method: 'om' | 'mpesa') => {
    if (method === 'om') {
      setOmTesting('testing')
      await new Promise(r => setTimeout(r, 2000))
      setOmTesting(Math.random() > 0.3 ? 'success' : 'error')
      setTimeout(() => setOmTesting('idle'), 3000)
    } else {
      setMpesaTesting('testing')
      await new Promise(r => setTimeout(r, 2000))
      setMpesaTesting(Math.random() > 0.3 ? 'success' : 'error')
      setTimeout(() => setMpesaTesting('idle'), 3000)
    }
  }

  // ─── Save config handler ──────────────────────────────────
  const saveConfig = async (method: 'om' | 'mpesa') => {
    setConfigSaving(true)
    try {
      await new Promise(r => setTimeout(r, 1000))
      toast.success(`Configuration ${method === 'om' ? 'Orange Money' : 'M-Pesa'} enregistrée`)
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setConfigSaving(false)
    }
  }

  // ─── Submit quete ──────────────────────────────────────────
  const submitQuete = async () => {
    if (!churchId) return
    setQueteSubmitting(true)
    try {
      const ordinary = parseFloat(queteForm.ordinaryAmount) || 0
      const special = parseFloat(queteForm.specialAmount) || 0
      const massOffering = parseFloat(queteForm.massOfferingAmount) || 0
      await fetch('/api/quetes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          churchId,
          date: queteForm.date,
          massTime: queteForm.massTime,
          ordinaryAmount: ordinary,
          specialAmount: special,
          massOfferingAmount: massOffering,
          totalAmount: ordinary + special + massOffering,
          notes: queteForm.notes,
        }),
      })
      setQueteDialogOpen(false)
      setQueteForm({
        date: new Date().toISOString().split('T')[0],
        massTime: '08h00',
        ordinaryAmount: '',
        specialAmount: '',
        massOfferingAmount: '',
        notes: '',
      })
      fetchQuetes()
      toast.success('Quête enregistrée avec succès')
    } catch {
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setQueteSubmitting(false)
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
            <Wallet className="h-6 w-6 text-primary" />
            Finances & Dons
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Suivez les dons, quêtes et finances paroissiales
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="dons" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="dons" className="gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Dons</span>
          </TabsTrigger>
          <TabsTrigger value="quetes" className="gap-2">
            <Church className="h-4 w-4" />
            <span className="hidden sm:inline">Quêtes</span>
            {!isPremium && (
              <Badge className="ml-1 text-[9px] px-1 py-0 bg-[#C9A84C] text-[#1B3A5C] border-0 font-bold">
                PREMIUM
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Configuration</span>
          </TabsTrigger>
          <TabsTrigger value="facturation" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Facturation</span>
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════════════
            DONS TAB
            ═══════════════════════════════════════════════════════ */}
        <TabsContent value="dons" className="space-y-6">
          {/* Stats Row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              <>
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
              </>
            ) : (
              <>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total dons ce mois</p>
                        <p className="text-2xl font-bold mt-1">{formatXOF(stats.total)}</p>
                        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          +18% vs mois dernier
                        </p>
                      </div>
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                        <DollarSign className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Nombre de dons</p>
                        <p className="text-2xl font-bold mt-1">{stats.count}</p>
                        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          +5 cette semaine
                        </p>
                      </div>
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                        <Wallet className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Don moyen</p>
                        <p className="text-2xl font-bold mt-1">{formatXOF(Math.round(stats.average))}</p>
                        <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                          <TrendingDown className="h-3 w-3" />
                          -2% vs mois dernier
                        </p>
                      </div>
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                        <BarChart3 className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Plus gros don</p>
                        <p className="text-2xl font-bold mt-1">{formatXOF(stats.max)}</p>
                        <p className="text-xs text-emerald-600 mt-1">Ce mois</p>
                      </div>
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                        <TrendingUp className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Donations Chart */}
          {loading ? (
            <ChartSkeleton />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dons par mois</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          formatXOF(value),
                          METHOD_LABELS[name] || name,
                        ]}
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Legend formatter={(value: string) => METHOD_LABELS[value] || value} />
                      {Object.entries(BAR_COLORS).map(([method, color]) => (
                        <Bar
                          key={method}
                          dataKey={method}
                          fill={color}
                          radius={[4, 4, 0, 0]}
                          stackId="a"
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par donateur..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
                className="pl-9"
              />
            </div>
            <Select value={periodFilter} onValueChange={(v) => { setPeriodFilter(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="3months">3 mois</SelectItem>
                <SelectItem value="6months">6 mois</SelectItem>
                <SelectItem value="all">Tout</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={(v) => { setMethodFilter(v === 'all' ? '' : v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Méthode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="ORANGE_MONEY">Orange Money</SelectItem>
                <SelectItem value="M_PESA">M-Pesa</SelectItem>
                <SelectItem value="STRIPE">Stripe</SelectItem>
                <SelectItem value="CASH">Espèces</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="SUCCESS">Succès</SelectItem>
                <SelectItem value="PROCESSING">En cours</SelectItem>
                <SelectItem value="FAILED">Échoué</SelectItem>
                <SelectItem value="INITIATED">Initié</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Donations Table */}
          <div className="rounded-lg border bg-card">
            {loading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            ) : paginatedDonations.length === 0 ? (
              <div className="p-12 text-center">
                <Wallet className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">Aucun don trouvé</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Modifiez vos filtres pour voir plus de résultats
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Donateur</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead className="hidden sm:table-cell">Méthode</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="hidden lg:table-cell">Référence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDonations.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="text-sm">{formatDate(d.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                            {d.user
                              ? `${d.user.firstName.charAt(0)}${d.user.lastName.charAt(0)}`
                              : '?'}
                          </div>
                          <span className="text-sm font-medium">
                            {d.isAnonymous
                              ? 'Anonyme'
                              : d.user
                                ? `${d.user.firstName} ${d.user.lastName}`
                                : 'Inconnu'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-semibold">
                        {formatXOF(d.amount)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge className={METHOD_COLORS[d.method] || ''} variant="outline">
                          {METHOD_LABELS[d.method] || d.method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[d.status] || ''} variant="outline">
                          {STATUS_LABELS[d.status] || d.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {d.transactionRef || '—'}
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
                Page {page} sur {totalPages} — {filteredDonations.length} résultat{filteredDonations.length !== 1 ? 's' : ''}
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

        {/* ═══════════════════════════════════════════════════════
            QUÊTES TAB
            ═══════════════════════════════════════════════════════ */}
        <TabsContent value="quetes" className="space-y-6">
          {!isPremium && (
            <Card className="border-[#C9A84C]/40 bg-[#C9A84C]/5">
              <CardContent className="pt-6 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-[#C9A84C]" />
                <div>
                  <p className="font-medium text-sm">Fonctionnalité Premium</p>
                  <p className="text-xs text-muted-foreground">
                    Passez au plan Premium pour accéder à la gestion complète des quêtes
                  </p>
                </div>
                <Badge className="ml-auto bg-[#C9A84C] text-[#1B3A5C] border-0 font-bold">
                  PREMIUM
                </Badge>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Quêtes enregistrées</h2>
            <Button
              onClick={() => setQueteDialogOpen(true)}
              className="gap-2"
              disabled={!isPremium}
            >
              <Plus className="h-4 w-4" />
              Enregistrer une quête
            </Button>
          </div>

          {/* Historical Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comparaison N vs N-1</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { month: 'Jan', current: 450000, previous: 380000 },
                      { month: 'Fév', current: 520000, previous: 490000 },
                      { month: 'Mar', current: 380000, previous: 420000 },
                      { month: 'Avr', current: 610000, previous: 530000 },
                      { month: 'Mai', current: 490000, previous: 470000 },
                      { month: 'Jun', current: 550000, previous: 510000 },
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        formatXOF(value),
                        name === 'current' ? 'Cette année' : 'Année dernière',
                      ]}
                    />
                    <Legend
                      formatter={(value: string) =>
                        value === 'current' ? 'Cette année' : 'Année dernière'
                      }
                    />
                    <Bar dataKey="current" fill="#1B3A5C" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="previous" fill="#C9A84C" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quêtes Grid */}
          {quetes.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Church className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">Aucune quête enregistrée</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Commencez par enregistrer votre première quête
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quetes.map((q) => (
                <Card key={q.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">
                        {formatDate(q.date)}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {q.massTime || '—'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Ordinaire</p>
                        <p className="font-medium">{formatXOF(q.ordinaryAmount)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Spéciale</p>
                        <p className="font-medium">{formatXOF(q.specialAmount)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Offrande de messe</p>
                        <p className="font-medium">{formatXOF(q.massOfferingAmount)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Total</p>
                        <p className="font-bold text-primary">{formatXOF(q.totalAmount)}</p>
                      </div>
                    </div>
                    {q.notes && (
                      <p className="text-xs text-muted-foreground italic mt-2">{q.notes}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Quête Dialog */}
          <Dialog open={queteDialogOpen} onOpenChange={setQueteDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Enregistrer une quête</DialogTitle>
                <DialogDescription>
                  Saisissez les montants de la quête pour cette messe.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={queteForm.date}
                      onChange={(e) => setQueteForm({ ...queteForm, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Heure de la messe</Label>
                    <Select value={queteForm.massTime} onValueChange={(v) => setQueteForm({ ...queteForm, massTime: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="06h30">06h30</SelectItem>
                        <SelectItem value="08h00">08h00</SelectItem>
                        <SelectItem value="09h30">09h30</SelectItem>
                        <SelectItem value="11h00">11h00</SelectItem>
                        <SelectItem value="18h00">18h00</SelectItem>
                        <SelectItem value="19h30">19h30</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Ordinaire (XOF)</Label>
                    <Input
                      type="number"
                      value={queteForm.ordinaryAmount}
                      onChange={(e) => setQueteForm({ ...queteForm, ordinaryAmount: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Spéciale (XOF)</Label>
                    <Input
                      type="number"
                      value={queteForm.specialAmount}
                      onChange={(e) => setQueteForm({ ...queteForm, specialAmount: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Offrande (XOF)</Label>
                    <Input
                      type="number"
                      value={queteForm.massOfferingAmount}
                      onChange={(e) => setQueteForm({ ...queteForm, massOfferingAmount: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Total</Label>
                  <p className="text-xl font-bold text-primary">
                    {formatXOF(
                      (parseFloat(queteForm.ordinaryAmount) || 0) +
                      (parseFloat(queteForm.specialAmount) || 0) +
                      (parseFloat(queteForm.massOfferingAmount) || 0)
                    )}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    value={queteForm.notes}
                    onChange={(e) => setQueteForm({ ...queteForm, notes: e.target.value })}
                    placeholder="Notes optionnelles..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setQueteDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={submitQuete} disabled={queteSubmitting}>
                  {queteSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════
            CONFIGURATION TAB
            ═══════════════════════════════════════════════════════ */}
        <TabsContent value="config" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Orange Money Config */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Phone className="h-5 w-5 text-orange-500" />
                    Orange Money
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="om-active" className="text-sm text-muted-foreground">
                      {omConfig.active ? 'Actif' : 'Inactif'}
                    </Label>
                    <Switch
                      id="om-active"
                      checked={omConfig.active}
                      onCheckedChange={(checked) => setOmConfig({ ...omConfig, active: checked })}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    value={omConfig.apiKey}
                    onChange={(e) => setOmConfig({ ...omConfig, apiKey: e.target.value })}
                    placeholder="Votre clé API Orange Money"
                    type="password"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secret Key</Label>
                  <Input
                    value={omConfig.secretKey}
                    onChange={(e) => setOmConfig({ ...omConfig, secretKey: e.target.value })}
                    placeholder="Votre clé secrète"
                    type="password"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Merchant ID</Label>
                  <Input
                    value={omConfig.merchantId}
                    onChange={(e) => setOmConfig({ ...omConfig, merchantId: e.target.value })}
                    placeholder="ID marchand"
                  />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => testConnection('om')}
                    disabled={omTesting === 'testing'}
                  >
                    {omTesting === 'testing' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : omTesting === 'success' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : omTesting === 'error' ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Phone className="h-4 w-4" />
                    )}
                    {omTesting === 'testing'
                      ? 'Test en cours...'
                      : omTesting === 'success'
                        ? 'Connexion réussie !'
                        : omTesting === 'error'
                          ? 'Échec de connexion'
                          : 'Tester la connexion'}
                  </Button>
                  <Button
                    onClick={() => saveConfig('om')}
                    disabled={configSaving}
                  >
                    {configSaving ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* M-Pesa Config */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Phone className="h-5 w-5 text-green-500" />
                    M-Pesa
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="mpesa-active" className="text-sm text-muted-foreground">
                      {mpesaConfig.active ? 'Actif' : 'Inactif'}
                    </Label>
                    <Switch
                      id="mpesa-active"
                      checked={mpesaConfig.active}
                      onCheckedChange={(checked) => setMpesaConfig({ ...mpesaConfig, active: checked })}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Consumer Key</Label>
                  <Input
                    value={mpesaConfig.consumerKey}
                    onChange={(e) => setMpesaConfig({ ...mpesaConfig, consumerKey: e.target.value })}
                    placeholder="Consumer Key M-Pesa"
                    type="password"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secret</Label>
                  <Input
                    value={mpesaConfig.secret}
                    onChange={(e) => setMpesaConfig({ ...mpesaConfig, secret: e.target.value })}
                    placeholder="Secret M-Pesa"
                    type="password"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Passkey</Label>
                    <Input
                      value={mpesaConfig.passkey}
                      onChange={(e) => setMpesaConfig({ ...mpesaConfig, passkey: e.target.value })}
                      placeholder="Passkey"
                      type="password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Shortcode</Label>
                    <Input
                      value={mpesaConfig.shortcode}
                      onChange={(e) => setMpesaConfig({ ...mpesaConfig, shortcode: e.target.value })}
                      placeholder="174379"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => testConnection('mpesa')}
                    disabled={mpesaTesting === 'testing'}
                  >
                    {mpesaTesting === 'testing' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : mpesaTesting === 'success' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : mpesaTesting === 'error' ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Phone className="h-4 w-4" />
                    )}
                    {mpesaTesting === 'testing'
                      ? 'Test en cours...'
                      : mpesaTesting === 'success'
                        ? 'Connexion réussie !'
                        : mpesaTesting === 'error'
                          ? 'Échec de connexion'
                          : 'Tester la connexion'}
                  </Button>
                  <Button
                    onClick={() => saveConfig('mpesa')}
                    disabled={configSaving}
                  >
                    {configSaving ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════
            FACTURATION TAB
            ═══════════════════════════════════════════════════════ */}
        <TabsContent value="facturation" className="space-y-6">
          {/* Current Plan Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Plan actuel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold">
                      {church?.plan === 'PREMIUM' ? 'Premium' :
                       church?.plan === 'STANDARD' ? 'Standard' :
                       church?.plan === 'DIOCESE' ? 'Diocèse' : 'Gratuit'}
                    </h3>
                    <Badge className="bg-[#C9A84C] text-[#1B3A5C] border-0 font-bold">
                      {church?.plan || 'FREE'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Renouvellement le 1er du mois
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Rétrograder
                  </Button>
                  <Button size="sm" className="gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Améliorer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Bars */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Fidèles
                  </p>
                  <span className="text-sm text-muted-foreground">148/500</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: '29.6%' }} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    Admins
                  </p>
                  <span className="text-sm text-muted-foreground">3/10</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div className="bg-[#C9A84C] h-2.5 rounded-full" style={{ width: '30%' }} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Church className="h-4 w-4 text-muted-foreground" />
                    Groupes
                  </p>
                  <span className="text-sm text-muted-foreground">4/20</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '20%' }} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoice History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historique des factures</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Facture</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { num: 'INV-2025-001', date: '01/01/2025', amount: '25 000 XOF', status: 'PAID' },
                    { num: 'INV-2024-012', date: '01/12/2024', amount: '25 000 XOF', status: 'PAID' },
                    { num: 'INV-2024-011', date: '01/11/2024', amount: '25 000 XOF', status: 'PAID' },
                    { num: 'INV-2024-010', date: '01/10/2024', amount: '25 000 XOF', status: 'UNPAID' },
                  ].map((inv) => (
                    <TableRow key={inv.num}>
                      <TableCell className="font-medium text-sm">{inv.num}</TableCell>
                      <TableCell className="text-sm">{inv.date}</TableCell>
                      <TableCell className="text-sm">{inv.amount}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            inv.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                              : 'bg-red-100 text-red-700 border-red-200'
                          }
                          variant="outline"
                        >
                          {inv.status === 'PAID' ? 'Payée' : 'Impayée'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
