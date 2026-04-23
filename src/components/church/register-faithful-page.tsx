'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Church, ArrowLeft, Eye, EyeOff, Loader2, MapPin,
  Users, Globe, Mail, CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useAppStore, type User, type Church as ChurchType } from '@/lib/store'
import { toast } from 'sonner'

export default function RegisterFaithfulPage() {
  const { setPage, selectedChurch, login } = useAppStore()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [acceptNewsletter, setAcceptNewsletter] = useState(false)
  const [loading, setLoading] = useState(false)

  // If no church selected, show message
  if (!selectedChurch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B3A5C] via-[#1f4570] to-[#1B3A5C] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Crect x='27' y='0' width='6' height='60'/%3E%3Crect x='0' y='27' width='60' height='6'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center"
        >
          <Church className="size-16 text-[#C9A84C] mx-auto mb-4" />
          <h2 className="text-xl font-serif font-bold text-white mb-2">
            Aucune paroisse sélectionnée
          </h2>
          <p className="text-white/60 text-sm mb-6 max-w-sm">
            Veuillez d&apos;abord rechercher et sélectionner votre paroisse avant de créer votre compte.
          </p>
          <Button
            onClick={() => setPage('church-search')}
            className="bg-[#C9A84C] hover:bg-[#B8973B] text-[#1B3A5C] font-semibold gap-2"
          >
            Trouver ma paroisse
          </Button>
        </motion.div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!firstName.trim()) {
      toast.error('Le prénom est requis')
      return
    }
    if (!lastName.trim()) {
      toast.error('Le nom est requis')
      return
    }
    if (!email.trim()) {
      toast.error('L\'email est requis')
      return
    }
    if (!password || password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          phone: phone || undefined,
          churchId: selectedChurch.id,
          registrationType: 'faithful',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.message || 'Erreur lors de l\'inscription')
        return
      }

      login(data.user as User, data.church as ChurchType)
      toast.success(`Bienvenue, ${data.user.firstName} ! Votre compte a été créé.`)
      setPage('dashboard')
    } catch {
      toast.error('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6 flex items-center gap-3 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setPage('church-search')}
          className="shrink-0"
          aria-label="Retour"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-lg font-serif font-bold text-[#1B3A5C]">Créer mon compte fidèle</h1>
          <p className="text-xs text-muted-foreground">Rejoignez votre paroisse en ligne</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center p-4 sm:p-6 md:p-8 overflow-y-auto">
        <div className="w-full max-w-xl">
          {/* Church banner */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-0 shadow-md bg-gradient-to-r from-[#1B3A5C] to-[#2A4F7F] text-white mb-6 overflow-hidden relative">
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Crect x='27' y='0' width='6' height='60'/%3E%3Crect x='0' y='27' width='60' height='6'/%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
              <CardContent className="p-5 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/15 shrink-0">
                    {selectedChurch.logoUrl ? (
                      <img
                        src={selectedChurch.logoUrl}
                        alt={selectedChurch.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <Church className="size-7" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-serif font-bold text-lg truncate">
                      {selectedChurch.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      {selectedChurch.city && (
                        <span className="text-white/70 text-xs flex items-center gap-1">
                          <MapPin className="size-3" />
                          {selectedChurch.city}
                        </span>
                      )}
                      {selectedChurch.country && (
                        <span className="text-white/70 text-xs flex items-center gap-1">
                          <Globe className="size-3" />
                          {selectedChurch.country}
                        </span>
                      )}
                      {selectedChurch.numberOfFaithful && (
                        <span className="text-white/70 text-xs flex items-center gap-1">
                          <Users className="size-3" />
                          {selectedChurch.numberOfFaithful} fidèles
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge className="bg-[#C9A84C] text-[#1B3A5C] border-0 font-semibold shrink-0">
                    <CheckCircle2 className="size-3 mr-1" />
                    Rejoindre
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Registration form */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Name fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  placeholder="Marie"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  placeholder="Dupont"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="marie.dupont@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                Téléphone <span className="text-muted-foreground text-xs">(optionnel)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+221 77 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 8 caractères"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirm ? 'Masquer' : 'Afficher'}
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {confirmPassword && (
                  <p className={`text-xs ${
                    password === confirmPassword
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {password === confirmPassword ? '✓ Correspond' : '✗ Ne correspond pas'}
                  </p>
                )}
              </div>
            </div>

            {/* Newsletter */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="newsletter"
                checked={acceptNewsletter}
                onCheckedChange={(checked) => setAcceptNewsletter(checked === true)}
              />
              <Label htmlFor="newsletter" className="text-sm font-normal leading-snug cursor-pointer">
                Je souhaite recevoir les actualités de ma paroisse par email
              </Label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C9A84C] hover:bg-[#B8973B] text-[#1B3A5C] font-semibold gap-2"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  Créer mon compte
                  <CheckCircle2 className="size-4" />
                </>
              )}
            </Button>
          </motion.form>
        </div>
      </div>

      {/* Bottom link */}
      <div className="p-4 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          Déjà un compte ?{' '}
          <button
            onClick={() => setPage('login')}
            className="text-[#1B3A5C] font-medium underline underline-offset-2 hover:text-[#C9A84C] transition-colors"
          >
            Se connecter
          </button>
        </p>
      </div>
    </div>
  )
}
