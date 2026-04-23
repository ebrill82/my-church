'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Church, Eye, EyeOff, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore, type User, type Church as ChurchType } from '@/lib/store'
import { toast } from 'sonner'

interface ChurchOption {
  id: string
  name: string
  slug: string
}

export function AuthModal() {
  const { authModalOpen, authModalTab, setAuthModal, login } = useAppStore()

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  // Register form state
  const [regFirstName, setRegFirstName] = useState('')
  const [regLastName, setRegLastName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [regChurchId, setRegChurchId] = useState('')
  const [regLoading, setRegLoading] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [churches, setChurches] = useState<ChurchOption[]>([])
  const [churchesLoading, setChurchesLoading] = useState(false)

  // Fetch churches for register dropdown
  const fetchChurches = useCallback(async () => {
    setChurchesLoading(true)
    try {
      const res = await fetch('/api/churches')
      if (res.ok) {
        const data = await res.json()
        setChurches(data)
      }
    } catch {
      // Silently fail - churches are optional
    } finally {
      setChurchesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authModalOpen && authModalTab === 'register') {
      fetchChurches()
    }
  }, [authModalOpen, authModalTab, fetchChurches])

  // Reset form when modal closes
  useEffect(() => {
    if (!authModalOpen) {
      setLoginEmail('')
      setLoginPassword('')
      setRegFirstName('')
      setRegLastName('')
      setRegEmail('')
      setRegPhone('')
      setRegPassword('')
      setRegConfirmPassword('')
      setRegChurchId('')
    }
  }, [authModalOpen])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.message || 'Erreur de connexion')
        return
      }

      login(data.user as User, data.church as ChurchType | null)
      toast.success(`Bienvenue, ${data.user.firstName} !`)
    } catch {
      toast.error('Erreur de connexion au serveur')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (regPassword !== regConfirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    if (regPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setRegLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          firstName: regFirstName,
          lastName: regLastName,
          phone: regPhone || undefined,
          churchId: regChurchId || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.message || 'Erreur lors de l\'inscription')
        return
      }

      // Auto-login after registration
      login(data.user as User, data.church as ChurchType | null)
      toast.success(`Bienvenue, ${data.user.firstName} ! Votre compte a été créé.`)
    } catch {
      toast.error('Erreur de connexion au serveur')
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <Dialog open={authModalOpen} onOpenChange={(open) => setAuthModal(open, authModalTab)}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {/* Header with church branding */}
        <div className="church-gradient px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 text-white">
              <Church className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-white text-lg">My Church</DialogTitle>
              <DialogDescription className="text-white/70 text-xs">
                Gestion digitale pour paroisses
              </DialogDescription>
            </div>
          </div>
        </div>

        <Tabs
          value={authModalTab}
          onValueChange={(value) => setAuthModal(true, value as 'login' | 'register')}
          className="w-full"
        >
          <div className="px-6 pt-2">
            <TabsList className="w-full">
              <TabsTrigger value="login" className="flex-1">
                Connexion
              </TabsTrigger>
              <TabsTrigger value="register" className="flex-1">
                Inscription
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Login Tab */}
          <TabsContent value="login" className="px-6 pb-6 pt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="votre@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">Mot de passe</Label>
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => toast.info('Fonctionnalité à venir')}
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showLoginPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showLoginPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>

              {/* Demo credentials hint */}
              <div className="rounded-lg bg-muted/50 border border-border p-3">
                <p className="text-xs text-muted-foreground text-center">
                  <span className="font-medium text-foreground">Démo :</span>{' '}
                  admin@saintjean.sn / password123
                </p>
              </div>
            </form>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register" className="px-6 pb-6 pt-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="reg-firstname">Prénom</Label>
                  <Input
                    id="reg-firstname"
                    placeholder="Jean"
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-lastname">Nom</Label>
                  <Input
                    id="reg-lastname"
                    placeholder="Dupont"
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="votre@email.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-phone">
                  Téléphone <span className="text-muted-foreground text-xs">(optionnel)</span>
                </Label>
                <Input
                  id="reg-phone"
                  type="tel"
                  placeholder="+221 77 123 45 67"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showRegPassword ? 'text' : 'password'}
                    placeholder="Minimum 8 caractères"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showRegPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showRegPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-confirm-password">Confirmer le mot de passe</Label>
                <Input
                  id="reg-confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-church">Paroisse</Label>
                <Select value={regChurchId} onValueChange={setRegChurchId}>
                  <SelectTrigger id="reg-church">
                    <SelectValue placeholder={churchesLoading ? 'Chargement...' : 'Sélectionnez votre paroisse'} />
                  </SelectTrigger>
                  <SelectContent>
                    {churches.map((church) => (
                      <SelectItem key={church.id} value={church.id}>
                        {church.name}
                      </SelectItem>
                    ))}
                    {churches.length === 0 && !churchesLoading && (
                      <SelectItem value="__none" disabled>
                        Aucune paroisse disponible
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={regLoading}>
                {regLoading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  'Créer mon compte'
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
