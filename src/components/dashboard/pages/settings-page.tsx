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
  Settings,
  Church,
  Palette,
  Users,
  Download,
  Upload,
  Shield,
  Plus,
  Trash2,
  Crown,
  Save,
  AlertTriangle,
  Eye,
  MapPin,
  Phone,
  Mail,
  Globe,
  Camera,
} from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

// ─── Types ──────────────────────────────────────────────────────────────────

interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  isActive: boolean
}

interface AuditLog {
  id: string
  action: string
  entity: string
  entityId: string | null
  oldValues: string | null
  newValues: string | null
  createdAt: string
  user?: {
    firstName: string
    lastName: string
  } | null
}

// ─── Constants ──────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN_PAROISSE: 'Admin Paroisse',
  ABBE: 'Abbé',
  DIRIGEANT_GROUPE: 'Dirigeant de groupe',
  PAROISSIEN: 'Paroissien',
  VISITEUR: 'Visiteur',
}

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-red-100 text-red-700 border-red-200',
  ADMIN_PAROISSE: 'bg-blue-100 text-blue-700 border-blue-200',
  ABBE: 'bg-purple-100 text-purple-700 border-purple-200',
  DIRIGEANT_GROUPE: 'bg-amber-100 text-amber-700 border-amber-200',
}

const FONT_OPTIONS = [
  { value: 'Playfair Display', label: 'Playfair Display', sample: 'font-serif' },
  { value: 'Inter', label: 'Inter', sample: 'font-sans' },
  { value: 'Lora', label: 'Lora', sample: 'font-serif' },
  { value: 'Merriweather', label: 'Merriweather', sample: 'font-serif' },
]

// ─── Component ──────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { church, user } = useAppStore()
  const churchId = church?.id

  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Church form state
  const [churchForm, setChurchForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    diocese: '',
    motto: '',
    description: '',
  })

  // Customization form state
  const [customForm, setCustomForm] = useState({
    primaryColor: '#1B3A5C',
    secondaryColor: '#C9A84C',
    fontFamily: 'Inter',
    customDomain: '',
  })

  // Admin dialog
  const [addAdminOpen, setAddAdminOpen] = useState(false)
  const [adminForm, setAdminForm] = useState({
    email: '',
    role: 'ADMIN_PAROISSE',
  })

  // Remove admin dialog
  const [removeAdminOpen, setRemoveAdminOpen] = useState(false)
  const [adminToRemove, setAdminToRemove] = useState<AdminUser | null>(null)

  // Audit filters
  const [auditActionFilter, setAuditActionFilter] = useState<string>('')

  const isPremium = church?.plan === 'PREMIUM' || church?.plan === 'DIOCESE'

  // ─── Initialize form from church data ─────────────────────────────────
  useEffect(() => {
    if (church) {
      setChurchForm({
        name: church.name || '',
        address: church.address || '',
        phone: church.phone || '',
        email: church.email || '',
        website: church.website || '',
        diocese: church.diocese || '',
        motto: church.motto || '',
        description: church.description || '',
      })
      setCustomForm({
        primaryColor: church.primaryColor || '#1B3A5C',
        secondaryColor: church.secondaryColor || '#C9A84C',
        fontFamily: church.fontFamily || 'Inter',
        customDomain: church.customDomain || '',
      })
    }
  }, [church])

  // ─── Fetch admins & audit logs ────────────────────────────────────────
  const fetchAdmins = useCallback(async () => {
    if (!churchId) return
    try {
      const res = await fetch(`/api/churches/${churchId}/members?limit=100&status=active`)
      if (res.ok) {
        const data = await res.json()
        const adminUsers = (data.members || []).filter(
          (m: AdminUser) => ['SUPER_ADMIN', 'ADMIN_PAROISSE', 'ABBE', 'DIRIGEANT_GROUPE'].includes(m.role)
        )
        setAdmins(adminUsers)
      }
    } catch (error) {
      console.error('Error fetching admins:', error)
    } finally {
      setLoading(false)
    }
  }, [churchId])

  const fetchAuditLogs = useCallback(async () => {
    if (!churchId) return
    try {
      const res = await fetch(`/api/audit?churchId=${churchId}`)
      if (res.ok) {
        const data = await res.json()
        setAuditLogs(data.logs || [])
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    }
  }, [churchId])

  useEffect(() => {
    fetchAdmins()
    fetchAuditLogs()
  }, [fetchAdmins, fetchAuditLogs])

  // ─── Handlers ─────────────────────────────────────────────────────────
  const handleSaveChurch = async () => {
    if (!churchId) return
    setSaving(true)
    try {
      const res = await fetch(`/api/churches/${churchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(churchForm),
      })
      if (res.ok) {
        toast.success('Paramètres de la paroisse sauvegardés')
      } else {
        toast.error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Error saving church:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveCustomization = () => {
    toast.success('Personnalisation sauvegardée')
  }

  const handleAddAdmin = () => {
    if (!adminForm.email) return
    toast.success(`Invitation envoyée à ${adminForm.email}`)
    setAddAdminOpen(false)
    setAdminForm({ email: '', role: 'ADMIN_PAROISSE' })
  }

  const handleRemoveAdmin = () => {
    if (!adminToRemove) return
    toast.success(`${adminToRemove.firstName} ${adminToRemove.lastName} a été retiré des admins`)
    setRemoveAdminOpen(false)
    setAdminToRemove(null)
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

  const filteredAuditLogs = auditLogs.filter((log) => {
    if (auditActionFilter && log.action !== auditActionFilter) return false
    return true
  })

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Paramètres
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configurez votre paroisse et vos préférences
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="paroisse" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="paroisse" className="gap-1.5">
            <Church className="h-3.5 w-3.5" />
            Paroisse
          </TabsTrigger>
          <TabsTrigger value="customization" className="gap-1.5">
            <Palette className="h-3.5 w-3.5" />
            Personnalisation
          </TabsTrigger>
          <TabsTrigger value="admins" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Admins
          </TabsTrigger>
          <TabsTrigger value="backup" className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Sauvegarde
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Journal d&apos;audit
          </TabsTrigger>
        </TabsList>

        {/* ─── Paroisse Tab ────────────────────────────────────────────── */}
        <TabsContent value="paroisse">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Church className="h-5 w-5 text-primary" />
                Informations de la paroisse
              </CardTitle>
              <CardDescription>
                Modifier les informations de votre paroisse
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="church-name">Nom *</Label>
                  <Input
                    id="church-name"
                    value={churchForm.name}
                    onChange={(e) => setChurchForm({ ...churchForm, name: e.target.value })}
                    placeholder="Nom de la paroisse"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="church-diocese">Diocèse</Label>
                  <Input
                    id="church-diocese"
                    value={churchForm.diocese}
                    onChange={(e) => setChurchForm({ ...churchForm, diocese: e.target.value })}
                    placeholder="Nom du diocèse"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="church-address">Adresse</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="church-address"
                    value={churchForm.address}
                    onChange={(e) => setChurchForm({ ...churchForm, address: e.target.value })}
                    placeholder="Adresse complète"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="church-phone">Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="church-phone"
                      value={churchForm.phone}
                      onChange={(e) => setChurchForm({ ...churchForm, phone: e.target.value })}
                      placeholder="+221 33 800 00 00"
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="church-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="church-email"
                      type="email"
                      value={churchForm.email}
                      onChange={(e) => setChurchForm({ ...churchForm, email: e.target.value })}
                      placeholder="paroisse@exemple.com"
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="church-website">Site web</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="church-website"
                      value={churchForm.website}
                      onChange={(e) => setChurchForm({ ...churchForm, website: e.target.value })}
                      placeholder="https://www.myparish.com"
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="church-motto">Devise</Label>
                  <Input
                    id="church-motto"
                    value={churchForm.motto}
                    onChange={(e) => setChurchForm({ ...churchForm, motto: e.target.value })}
                    placeholder="Devise de la paroisse"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="church-description">Description</Label>
                <Textarea
                  id="church-description"
                  value={churchForm.description}
                  onChange={(e) => setChurchForm({ ...churchForm, description: e.target.value })}
                  placeholder="Description de la paroisse"
                  rows={3}
                />
              </div>

              {/* Logo upload (decorative) */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Logo de la paroisse</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50">
                      {church?.logoUrl ? (
                        <img src={church.logoUrl} alt="Logo" className="h-16 w-16 object-contain" />
                      ) : (
                        <Church className="h-8 w-8 text-muted-foreground/50" />
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.info('Upload à venir')}>
                      <Camera className="h-3.5 w-3.5" />
                      Changer
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Photo de la paroisse</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-32 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50">
                      {church?.photoUrl ? (
                        <img src={church.photoUrl} alt="Photo" className="h-16 w-28 object-cover rounded" />
                      ) : (
                        <Camera className="h-8 w-8 text-muted-foreground/50" />
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.info('Upload à venir')}>
                      <Camera className="h-3.5 w-3.5" />
                      Changer
                    </Button>
                  </div>
                </div>
              </div>

              {/* Number of faithful */}
              <div className="rounded-lg bg-muted/50 p-4 flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Nombre de fidèles</p>
                  <p className="text-2xl font-bold">{church?.numberOfFaithful || 0}</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveChurch} disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Personnalisation Tab ─────────────────────────────────────── */}
        <TabsContent value="customization">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Personnalisation
                </CardTitle>
                <CardDescription>
                  Personnalisez l&apos;apparence de votre page publique
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Couleur primaire</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="primary-color"
                        value={customForm.primaryColor}
                        onChange={(e) => setCustomForm({ ...customForm, primaryColor: e.target.value })}
                        className="h-10 w-10 rounded border cursor-pointer"
                      />
                      <Input
                        value={customForm.primaryColor}
                        onChange={(e) => setCustomForm({ ...customForm, primaryColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary-color">Couleur secondaire</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="secondary-color"
                        value={customForm.secondaryColor}
                        onChange={(e) => setCustomForm({ ...customForm, secondaryColor: e.target.value })}
                        className="h-10 w-10 rounded border cursor-pointer"
                      />
                      <Input
                        value={customForm.secondaryColor}
                        onChange={(e) => setCustomForm({ ...customForm, secondaryColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Police de caractères</Label>
                  <Select value={customForm.fontFamily} onValueChange={(v) => setCustomForm({ ...customForm, fontFamily: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <span className={font.sample}>{font.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="custom-domain">Domaine personnalisé</Label>
                    {!isPremium && (
                      <Badge className="text-[9px] px-1.5 py-0 bg-[#C9A84C] text-[#1B3A5C] border-0 font-bold">
                        PREMIUM
                      </Badge>
                    )}
                  </div>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="custom-domain"
                      value={customForm.customDomain}
                      onChange={(e) => setCustomForm({ ...customForm, customDomain: e.target.value })}
                      placeholder="monparoisse.mychurch.app"
                      className="pl-9"
                      disabled={!isPremium}
                    />
                  </div>
                  {!isPremium && (
                    <p className="text-xs text-muted-foreground">
                      Passez au plan Premium pour utiliser un domaine personnalisé
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveCustomization} className="gap-2">
                    <Save className="h-4 w-4" />
                    Sauvegarder
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aperçu de la page publique</CardTitle>
                <CardDescription>
                  Voici comment votre page sera affichée
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  {/* Header preview */}
                  <div
                    className="p-6 text-white"
                    style={{ backgroundColor: customForm.primaryColor }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                        <Church className="h-6 w-6" />
                      </div>
                      <div>
                        <h3
                          className={`text-lg font-bold ${customForm.fontFamily === 'Playfair Display' || customForm.fontFamily === 'Lora' || customForm.fontFamily === 'Merriweather' ? 'font-serif' : 'font-sans'}`}
                        >
                          {churchForm.name || 'Ma Paroisse'}
                        </h3>
                        <p className="text-sm text-white/80">{churchForm.motto || 'Devise de la paroisse'}</p>
                      </div>
                    </div>
                  </div>
                  {/* Body preview */}
                  <div className="p-4 bg-background space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{churchForm.address || 'Adresse'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{churchForm.phone || 'Téléphone'}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted w-full">
                      <div className="h-full rounded-full w-2/3" style={{ backgroundColor: customForm.secondaryColor }} />
                    </div>
                    <div className="flex gap-2">
                      <div
                        className="h-8 px-3 rounded-md flex items-center text-white text-xs font-medium"
                        style={{ backgroundColor: customForm.primaryColor }}
                      >
                        Contacter
                      </div>
                      <div
                        className="h-8 px-3 rounded-md border-2 flex items-center text-xs font-medium"
                        style={{ borderColor: customForm.secondaryColor, color: customForm.secondaryColor }}
                      >
                        Voir les horaires
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Admins Tab ───────────────────────────────────────────────── */}
        <TabsContent value="admins" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Administrateurs</h2>
            <Button onClick={() => setAddAdminOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter un admin
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : admins.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="text-lg font-medium">Aucun administrateur</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Ajoutez des administrateurs pour gérer votre paroisse
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead className="hidden sm:table-cell">Statut</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">
                        {admin.firstName} {admin.lastName}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{admin.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${ROLE_COLORS[admin.role] || 'bg-gray-100 text-gray-700 border-gray-200'}`}
                        >
                          {ROLE_LABELS[admin.role] || admin.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge className={admin.isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}>
                          {admin.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => {
                            setAdminToRemove(admin)
                            setRemoveAdminOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* ─── Sauvegarde Tab ──────────────────────────────────────────── */}
        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Sauvegarde des données
              </CardTitle>
              <CardDescription>
                Exportez et restaurez les données de votre paroisse
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Dernière sauvegarde</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      15 janvier 2025 à 14h30 — Sauvegarde automatique
                    </p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                    Complète
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Button
                  variant="outline"
                  className="h-auto py-6 flex flex-col items-center gap-2"
                  onClick={() => toast.info('Export à venir')}
                >
                  <Download className="h-6 w-6 text-primary" />
                  <span className="font-medium">Exporter toutes les données</span>
                  <span className="text-xs text-muted-foreground">JSON, CSV, Excel</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-6 flex flex-col items-center gap-2"
                  onClick={() => toast.info('Restauration à venir')}
                >
                  <Upload className="h-6 w-6 text-primary" />
                  <span className="font-medium">Restaurer depuis une sauvegarde</span>
                  <span className="text-xs text-muted-foreground">Importer un fichier</span>
                </Button>
              </div>

              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-amber-800 dark:text-amber-200">Attention</p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                      La restauration d&apos;une sauvegarde écrasera toutes les données actuelles.
                      Cette action est irréversible. Assurez-vous d&apos;avoir exporté vos données actuelles avant de restaurer.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Journal d'audit Tab ──────────────────────────────────────── */}
        <TabsContent value="audit" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">Journal d&apos;audit</h2>
            <Select value={auditActionFilter} onValueChange={(v) => setAuditActionFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrer par action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les actions</SelectItem>
                <SelectItem value="CREATE">Création</SelectItem>
                <SelectItem value="UPDATE">Modification</SelectItem>
                <SelectItem value="DELETE">Suppression</SelectItem>
                <SelectItem value="LOGIN">Connexion</SelectItem>
                <SelectItem value="LOGOUT">Déconnexion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredAuditLogs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <Shield className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="text-lg font-medium">Aucun log d&apos;audit</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Les actions administratives seront enregistrées ici
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="hidden md:table-cell">Entité</TableHead>
                    <TableHead className="hidden lg:table-cell">Détails</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAuditLogs.slice(0, 30).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Système'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                            log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            log.action === 'DELETE' ? 'bg-red-100 text-red-700 border-red-200' :
                            'bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {log.entity}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-[200px] truncate">
                        {log.newValues ? JSON.stringify(log.newValues).slice(0, 60) + '...' : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ─── Add Admin Dialog ────────────────────────────────────────────── */}
      <Dialog open={addAdminOpen} onOpenChange={setAddAdminOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Ajouter un admin</DialogTitle>
            <DialogDescription>
              Envoyez une invitation à un nouvel administrateur
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email *</Label>
              <Input
                id="admin-email"
                type="email"
                value={adminForm.email}
                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                placeholder="admin@paroisse.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Rôle *</Label>
              <Select value={adminForm.role} onValueChange={(v) => setAdminForm({ ...adminForm, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN_PAROISSE">Admin Paroisse</SelectItem>
                  <SelectItem value="ABBE">Abbé</SelectItem>
                  <SelectItem value="DIRIGEANT_GROUPE">Dirigeant de groupe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddAdminOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddAdmin} disabled={!adminForm.email} className="gap-2">
              <Plus className="h-4 w-4" />
              Envoyer l&apos;invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Remove Admin Confirmation ──────────────────────────────────── */}
      <AlertDialog open={removeAdminOpen} onOpenChange={setRemoveAdminOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer cet administrateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              {adminToRemove && (
                <>
                  Êtes-vous sûr de vouloir retirer <strong>{adminToRemove.firstName} {adminToRemove.lastName}</strong> des
                  administrateurs ? Cette action changera son rôle en paroissien.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRemoveAdminOpen(false)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveAdmin} className="bg-destructive text-white hover:bg-destructive/90">
              Retirer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
