'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  CreditCard,
  Crown,
  Check,
  X,
  Download,
  Zap,
  Gift,
  Building2,
  Users,
  Shield,
  FileText,
  ChevronRight,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Tag,
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Plan Definitions ───────────────────────────────────────────────────────

const PLANS = [
  {
    id: 'FREE',
    name: 'Gratuit',
    price: 0,
    priceLabel: 'Gratuit',
    period: '',
    icon: Gift,
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    borderColor: 'border-gray-200 dark:border-gray-700',
    features: [
      { label: 'Jusqu\'à 50 fidèles', included: true },
      { label: '2 admins', included: true },
      { label: '3 groupes', included: true },
      { label: '5 certificats/mois', included: true },
      { label: 'SMS', included: false },
      { label: 'Cimetière', included: false },
      { label: 'Domaine personnalisé', included: false },
    ],
    limits: { faithful: 50, admins: 2, groups: 3, certificates: 5 },
  },
  {
    id: 'STANDARD',
    name: 'Standard',
    price: 9900,
    priceLabel: '9 900 FCFA',
    period: '/mois',
    icon: Zap,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800',
    popular: true,
    features: [
      { label: 'Jusqu\'à 200 fidèles', included: true },
      { label: '5 admins', included: true },
      { label: '10 groupes', included: true },
      { label: '25 certificats/mois', included: true },
      { label: '100 SMS/mois', included: true },
      { label: 'Cimetière', included: false },
      { label: 'Domaine personnalisé', included: false },
    ],
    limits: { faithful: 200, admins: 5, groups: 10, certificates: 25 },
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    price: 24900,
    priceLabel: '24 900 FCFA',
    period: '/mois',
    icon: Crown,
    color: 'bg-[#C9A84C]/10 text-[#C9A84C]',
    borderColor: 'border-[#C9A84C]/30',
    recommended: true,
    features: [
      { label: 'Jusqu\'à 1 000 fidèles', included: true },
      { label: '10 admins', included: true },
      { label: 'Groupes illimités', included: true },
      { label: 'Certificats illimités', included: true },
      { label: '500 SMS/mois', included: true },
      { label: 'Cimetière', included: true },
      { label: 'Domaine personnalisé', included: true },
    ],
    limits: { faithful: 1000, admins: 10, groups: 999, certificates: 999 },
  },
  {
    id: 'DIOCESE',
    name: 'Diocèse',
    price: 0,
    priceLabel: 'Sur devis',
    period: '',
    icon: Building2,
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    borderColor: 'border-purple-200 dark:border-purple-800',
    features: [
      { label: 'Fidèles illimités', included: true },
      { label: 'Admins illimités', included: true },
      { label: 'Groupes illimités', included: true },
      { label: 'Certificats illimités', included: true },
      { label: 'SMS illimités', included: true },
      { label: 'Cimetière', included: true },
      { label: 'Multi-paroisses', included: true },
    ],
    limits: { faithful: 9999, admins: 999, groups: 999, certificates: 999 },
  },
]

// Demo invoices
const DEMO_INVOICES = [
  { id: 'INV-2025-001', date: '01/01/2025', amount: '24 900 FCFA', status: 'PAID', pdf: true },
  { id: 'INV-2024-012', date: '01/12/2024', amount: '24 900 FCFA', status: 'PAID', pdf: true },
  { id: 'INV-2024-011', date: '01/11/2024', amount: '24 900 FCFA', status: 'PAID', pdf: true },
  { id: 'INV-2024-010', date: '01/10/2024', amount: '24 900 FCFA', status: 'PAID', pdf: true },
  { id: 'INV-2024-009', date: '01/09/2024', amount: '24 900 FCFA', status: 'PAID', pdf: true },
]

// ─── Component ──────────────────────────────────────────────────────────────

export default function BillingPage() {
  const { church } = useAppStore()
  const currentPlan = church?.plan || 'FREE'
  const isPremium = currentPlan === 'PREMIUM' || currentPlan === 'DIOCESE'

  // Cancel subscription dialog
  const [cancelOpen, setCancelOpen] = useState(false)

  // Promo code
  const [promoCode, setPromoCode] = useState('')

  // Usage demo data
  const currentPlanData = PLANS.find((p) => p.id === currentPlan) || PLANS[0]
  const usage = {
    faithful: { current: church?.numberOfFaithful || 0, max: currentPlanData.limits.faithful },
    admins: { current: 3, max: currentPlanData.limits.admins },
    groups: { current: 4, max: currentPlanData.limits.groups },
    certificates: { current: 8, max: currentPlanData.limits.certificates },
  }

  const getUsageColor = (pct: number) => {
    if (pct > 90) return 'bg-red-500'
    if (pct > 70) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  const getUsageTextColor = (pct: number) => {
    if (pct > 90) return 'text-red-600'
    if (pct > 70) return 'text-amber-600'
    return 'text-emerald-600'
  }

  const handleApplyPromo = () => {
    if (!promoCode) return
    toast.info('Code promo vérifié (démo)')
    setPromoCode('')
  }

  const handleCancelSubscription = () => {
    toast.success('Abonnement résilié (démo)')
    setCancelOpen(false)
  }

  const handlePlanChange = (planId: string) => {
    if (planId === currentPlan) return
    toast.info(`Changement vers le plan ${planId} (démo)`)
  }

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" />
          Facturation
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gérez votre abonnement et vos factures
        </p>
      </div>

      {/* ─── Current Plan Card ────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        <div
          className="h-2"
          style={{
            background: currentPlan === 'PREMIUM'
              ? '#C9A84C'
              : currentPlan === 'DIOCESE'
              ? '#7C3AED'
              : currentPlan === 'STANDARD'
              ? '#3B82F6'
              : '#6B7280',
          }}
        />
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                currentPlan === 'PREMIUM'
                  ? 'bg-[#C9A84C]/10'
                  : currentPlan === 'DIOCESE'
                  ? 'bg-purple-100 dark:bg-purple-900/30'
                  : currentPlan === 'STANDARD'
                  ? 'bg-blue-100 dark:bg-blue-900/30'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}>
                {currentPlan === 'PREMIUM' ? (
                  <Crown className="h-7 w-7 text-[#C9A84C]" />
                ) : currentPlan === 'DIOCESE' ? (
                  <Building2 className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                ) : currentPlan === 'STANDARD' ? (
                  <Zap className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Gift className="h-7 w-7 text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{currentPlanData.name}</h2>
                  {currentPlanData.recommended && (
                    <Badge className="bg-[#C9A84C] text-[#1B3A5C] border-0 text-xs font-bold">
                      Recommandé
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">
                  {currentPlanData.priceLabel}{currentPlanData.period}
                  {' • '}
                  Période actuelle jusqu&apos;au 01/02/2025
                </p>
              </div>
            </div>
            <Button
              onClick={() => toast.info('Changement de plan à venir')}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Changer de plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ─── Usage Section ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Utilisation</CardTitle>
          <CardDescription>Suivez votre consommation par rapport aux limites de votre plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {[
            { label: 'Fidèles', key: 'faithful' as const, icon: Users },
            { label: 'Admins', key: 'admins' as const, icon: Shield },
            { label: 'Groupes', key: 'groups' as const, icon: Users },
            { label: 'Certificats ce mois', key: 'certificates' as const, icon: FileText },
          ].map((item) => {
            const data = usage[item.key]
            const max = data.max >= 999 ? 'Illimité' : data.max.toString()
            const pct = data.max >= 999 ? Math.min((data.current / 999) * 100, 50) : Math.round((data.current / data.max) * 100)
            const displayPct = data.max >= 999 ? Math.round((data.current / 999) * 100) : pct

            return (
              <div key={item.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className={`text-sm font-semibold ${getUsageTextColor(pct)}`}>
                    {data.current} / {max}
                    {data.max < 999 && <span className="text-muted-foreground font-normal ml-1">({pct}%)</span>}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getUsageColor(pct)}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* ─── Plan Comparison ───────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Comparer les plans</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan
            const Icon = plan.icon

            return (
              <Card
                key={plan.id}
                className={`relative transition-shadow hover:shadow-md ${
                  isCurrentPlan ? `ring-2 ring-primary ${plan.borderColor}` : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white border-0 text-xs font-bold whitespace-nowrap">
                      Le plus populaire
                    </Badge>
                  </div>
                )}
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#C9A84C] text-[#1B3A5C] border-0 text-xs font-bold whitespace-nowrap">
                      Meilleur rapport
                    </Badge>
                  </div>
                )}
                <CardContent className="p-6 pt-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${plan.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold">{plan.name}</h3>
                      <p className="text-lg font-bold text-primary">
                        {plan.priceLabel}
                        <span className="text-xs text-muted-foreground font-normal">{plan.period}</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    {plan.features.map((feature) => (
                      <div key={feature.label} className="flex items-center gap-2 text-sm">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                        )}
                        <span className={feature.included ? '' : 'text-muted-foreground/60'}>
                          {feature.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {isCurrentPlan ? (
                    <Button variant="outline" className="w-full" disabled>
                      Plan actuel
                    </Button>
                  ) : (
                    <Button
                      className={`w-full gap-1 ${
                        plan.recommended ? 'bg-[#C9A84C] text-[#1B3A5C] hover:bg-[#C9A84C]/90' : ''
                      }`}
                      variant={plan.recommended ? 'default' : 'outline'}
                      onClick={() => handlePlanChange(plan.id)}
                    >
                      {PLANS.findIndex((p) => p.id === plan.id) > PLANS.findIndex((p) => p.id === currentPlan) ? (
                        <>
                          Passer à {plan.name}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      ) : (
                        <>
                          Rétrograder
                          <ChevronRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* ─── Invoice History ────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historique des factures</CardTitle>
          <CardDescription>Vos factures et reçus de paiement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N°</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>PDF</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEMO_INVOICES.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium text-sm">{invoice.id}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{invoice.date}</TableCell>
                    <TableCell className="text-sm">{invoice.amount}</TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                        Payée
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 h-8"
                        onClick={() => toast.info('Téléchargement PDF (démo)')}
                      >
                        <Download className="h-3.5 w-3.5" />
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ─── Promo Code ────────────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="promo-code" className="whitespace-nowrap">Code promo</Label>
            </div>
            <div className="flex items-center gap-2 flex-1 w-full">
              <Input
                id="promo-code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Entrez votre code promo"
                className="flex-1"
              />
              <Button variant="outline" onClick={handleApplyPromo} disabled={!promoCode}>
                Appliquer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Cancel Subscription ────────────────────────────────────────── */}
      <Card className="border-destructive/30">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-medium text-destructive">Résilier l&apos;abonnement</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Votre accès sera maintenu jusqu&apos;à la fin de la période en cours
              </p>
            </div>
            <Button
              variant="outline"
              className="text-destructive border-destructive/50 hover:bg-destructive/10"
              onClick={() => setCancelOpen(true)}
            >
              Résilier
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ─── Cancel Confirmation ────────────────────────────────────────── */}
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Résilier l&apos;abonnement ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir résilier votre abonnement ? Votre accès sera maintenu
              jusqu&apos;à la fin de la période en cours (01/02/2025). Après cette date,
              votre compte sera rétrogradé au plan Gratuit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 my-2">
            <p className="text-xs text-amber-700 dark:text-amber-300">
              <strong>Attention :</strong> Certaines données peuvent être perdues si elles dépassent les limites du plan Gratuit
              (fidèles, groupes, certificats). Exportez vos données avant de résilier.
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCancelOpen(false)}>
              Garder mon abonnement
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Confirmer la résiliation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
