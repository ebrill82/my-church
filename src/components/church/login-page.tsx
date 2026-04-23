'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Church, Eye, EyeOff, Loader2, ArrowRight,
  Users, Globe, Shield, CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useAppStore, type User, type Church as ChurchType } from '@/lib/store'
import { toast } from 'sonner'

export default function LoginPage() {
  const { setPage, login } = useAppStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error('L\'email est requis')
      return
    }
    if (!password) {
      toast.error('Le mot de passe est requis')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.message || 'Erreur de connexion')
        return
      }

      login(data.user as User, data.church as ChurchType)
      toast.success(`Bienvenue, ${data.user.firstName} !`)
    } catch {
      toast.error('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Login form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 md:p-12 bg-background">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1B3A5C] text-white">
              <Church className="size-5" />
            </div>
            <span className="font-serif text-xl font-bold text-[#1B3A5C]">My Church</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1B3A5C] mb-2">
            Connexion
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Accédez à l&apos;espace de gestion de votre paroisse
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">Mot de passe</Label>
                <button
                  type="button"
                  className="text-xs text-[#1B3A5C] hover:text-[#C9A84C] transition-colors"
                  onClick={() => toast.info('Fonctionnalité à venir')}
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-3">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                Se souvenir de moi
              </Label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1B3A5C] hover:bg-[#15304d] text-white gap-2"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-6 space-y-3">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Votre paroisse n&apos;est pas encore sur My Church ?{' '}
                <button
                  onClick={() => setPage('register-church')}
                  className="text-[#1B3A5C] font-medium hover:text-[#C9A84C] transition-colors"
                >
                  Créez votre paroisse gratuitement
                </button>
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Vous êtes un fidèle ?{' '}
                <button
                  onClick={() => setPage('church-search')}
                  className="text-[#1B3A5C] font-medium hover:text-[#C9A84C] transition-colors"
                >
                  Rejoignez votre paroisse
                </button>
              </p>
            </div>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 space-y-2">
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="p-3">
                <p className="text-xs font-medium text-muted-foreground text-center mb-2">
                  Identifiants de démonstration
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center justify-center w-5 h-5 rounded bg-[#1B3A5C] text-white shrink-0">
                      <Church className="size-3" />
                    </div>
                    <span className="text-muted-foreground">admin@saintjean.sn / password123</span>
                    <span className="text-[10px] text-muted-foreground/60 ml-auto hidden sm:inline">Paroisse Saint Jean</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center justify-center w-5 h-5 rounded bg-[#C9A84C] text-[#1B3A5C] shrink-0">
                      <Church className="size-3" />
                    </div>
                    <span className="text-muted-foreground">admin@saintpierre.cm / password123</span>
                    <span className="text-[10px] text-muted-foreground/60 ml-auto hidden sm:inline">Paroisse Saint Pierre</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Right side - Decorative (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-gradient-to-br from-[#1B3A5C] via-[#2A4F7F] to-[#1B3A5C] items-center justify-center">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Crect x='27' y='0' width='6' height='60'/%3E%3Crect x='0' y='27' width='60' height='6'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Decorative circles */}
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-[#C9A84C]/5 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-white/3 blur-3xl" />

        <div className="relative z-10 text-center px-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Church className="size-20 text-[#C9A84C] mx-auto mb-8" />

            <h2 className="text-3xl font-serif font-bold text-white mb-4">
              Gérez votre paroisse<br />en toute simplicité
            </h2>

            <p className="text-white/60 text-sm leading-relaxed mb-10 max-w-sm mx-auto">
              La plateforme tout-en-un pour la gestion digitale des paroisses catholiques en Afrique.
              Activités, fidèles, finances, certificats — tout au même endroit.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 mx-auto mb-2">
                  <Users className="size-6 text-[#C9A84C]" />
                </div>
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-white/40 text-xs">Paroisses</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 mx-auto mb-2">
                  <Globe className="size-6 text-[#C9A84C]" />
                </div>
                <div className="text-2xl font-bold text-white">25+</div>
                <div className="text-white/40 text-xs">Pays</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 mx-auto mb-2">
                  <Shield className="size-6 text-[#C9A84C]" />
                </div>
                <div className="text-2xl font-bold text-white">100K+</div>
                <div className="text-white/40 text-xs">Fidèles</div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="mt-10 bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
              <p className="text-white/80 text-sm italic leading-relaxed mb-3">
                &ldquo;My Church a transformé la gestion de notre paroisse. Tout est maintenant digital et accessible en un clic.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C] text-xs font-bold">
                  PO
                </div>
                <div className="text-left">
                  <p className="text-white text-xs font-medium">Père Ouédraogo</p>
                  <p className="text-white/40 text-[10px]">Paroisse Saint Paul, Ouagadougou</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
