'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Church, ArrowRight, ArrowLeft, Eye, EyeOff, Loader2,
  Upload, Check, X, Pencil
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore, type User, type Church as ChurchType } from '@/lib/store'
import { toast } from 'sonner'

const AFRICAN_COUNTRIES = [
  { value: 'SN', label: 'Sénégal' },
  { value: 'CM', label: 'Cameroun' },
  { value: 'CI', label: "Côte d'Ivoire" },
  { value: 'CD', label: 'RDC' },
  { value: 'BF', label: 'Burkina Faso' },
  { value: 'ML', label: 'Mali' },
  { value: 'GN', label: 'Guinée' },
  { value: 'BJ', label: 'Bénin' },
  { value: 'TG', label: 'Togo' },
  { value: 'NE', label: 'Niger' },
  { value: 'GA', label: 'Gabon' },
  { value: 'CG', label: 'Congo' },
  { value: 'CF', label: 'Centrafrique' },
  { value: 'TD', label: 'Tchad' },
  { value: 'MG', label: 'Madagascar' },
  { value: 'BI', label: 'Burundi' },
  { value: 'RW', label: 'Rwanda' },
]

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
}

function getPasswordStrength(password: string): {
  score: number
  label: string
  color: string
  width: string
} {
  if (!password) return { score: 0, label: '', color: '', width: '0%' }
  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
  const length8 = password.length >= 8

  if (length8 && hasLower && hasUpper && hasNumber && hasSpecial) {
    return { score: 4, label: 'Fort', color: 'bg-green-500', width: '100%' }
  }
  if (length8 && hasLower && hasUpper && hasNumber) {
    return { score: 3, label: 'Bon', color: 'bg-yellow-500', width: '75%' }
  }
  if (length8 && hasLower && hasUpper) {
    return { score: 2, label: 'Moyen', color: 'bg-orange-500', width: '50%' }
  }
  if (length8) {
    return { score: 1, label: 'Faible', color: 'bg-red-500', width: '25%' }
  }
  return { score: 0, label: 'Trop court', color: 'bg-red-300', width: '10%' }
}

export default function RegisterChurchPage() {
  const { setPage, login } = useAppStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  // Step 1: Admin Account
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('ADMIN_PAROISSE')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Step 2: Parish Info
  const [churchName, setChurchName] = useState('')
  const [slug, setSlug] = useState('')
  const [diocese, setDiocese] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [numberOfFaithful, setNumberOfFaithful] = useState('')
  const [address, setAddress] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptPrivacy, setAcceptPrivacy] = useState(false)

  // Slug availability
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [slugChecking, setSlugChecking] = useState(false)

  // Auto-generate slug from church name
  useEffect(() => {
    if (!slugManuallyEdited && churchName) {
      const generated = generateSlug(churchName)
      setSlug(generated)
    }
  }, [churchName, slugManuallyEdited])

  // Debounced slug availability check
  useEffect(() => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null)
      return
    }

    setSlugChecking(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/churches/check-slug?slug=${encodeURIComponent(slug)}`)
        if (res.ok) {
          const data = await res.json()
          setSlugAvailable(data.available)
        }
      } catch {
        // Silently fail
      } finally {
        setSlugChecking(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [slug])

  const passwordStrength = getPasswordStrength(password)

  const handleSlugEdit = () => {
    setSlugManuallyEdited(true)
  }

  const handleSlugChange = (value: string) => {
    const sanitized = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    setSlug(sanitized)
  }

  const validateStep1 = (): boolean => {
    if (!firstName.trim()) {
      toast.error('Le prénom est requis')
      return false
    }
    if (!lastName.trim()) {
      toast.error('Le nom est requis')
      return false
    }
    if (!email.trim()) {
      toast.error('L\'email est requis')
      return false
    }
    if (!password || password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return false
    }
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return false
    }
    return true
  }

  const validateStep2 = (): boolean => {
    if (!churchName.trim()) {
      toast.error('Le nom de la paroisse est requis')
      return false
    }
    if (!slug || slug.length < 3) {
      toast.error('L\'identifiant URL doit contenir au moins 3 caractères')
      return false
    }
    if (slugAvailable === false) {
      toast.error('Cet identifiant URL est déjà utilisé')
      return false
    }
    if (!country) {
      toast.error('Le pays est requis')
      return false
    }
    if (!city.trim()) {
      toast.error('La ville est requise')
      return false
    }
    if (!acceptTerms) {
      toast.error('Vous devez accepter les conditions d\'utilisation')
      return false
    }
    if (!acceptPrivacy) {
      toast.error('Vous devez accepter la politique de confidentialité')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateStep2()) return

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
          registrationType: 'church',
          role,
          churchName,
          churchSlug: slug,
          diocese: diocese || undefined,
          country,
          city,
          numberOfFaithful: numberOfFaithful || undefined,
          address: address || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.message || 'Erreur lors de l\'inscription')
        return
      }

      login(data.user as User, data.church as ChurchType)
      toast.success(`Bienvenue, ${data.user.firstName} ! Votre paroisse a été créée.`)
      setPage('setup-wizard')
    } catch {
      toast.error('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { id: 1, label: 'Compte Admin' },
    { id: 2, label: 'Paroisse' },
  ]

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Left decorative side - hidden on mobile */}
      <div className="hidden lg:flex lg:w-2/5 relative bg-gradient-to-br from-[#1B3A5C] via-[#2A4F7F] to-[#1B3A5C] items-center justify-center">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Crect x='27' y='0' width='6' height='60'/%3E%3Crect x='0' y='27' width='60' height='6'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10 text-center px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Church className="size-24 text-[#C9A84C] mx-auto mb-6" />
            <h2 className="text-3xl font-serif font-bold text-white mb-3">
              Créez votre paroisse
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm mx-auto">
              Rejoignez plus de 500 paroisses qui font confiance à My Church pour leur gestion digitale.
              Configuration rapide, essai gratuit de 14 jours.
            </p>
            <div className="mt-8 flex items-center justify-center gap-6 text-white/40 text-xs">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#C9A84C]">500+</div>
                <div>Paroisses</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-bold text-[#C9A84C]">25+</div>
                <div>Pays</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-bold text-[#C9A84C]">14j</div>
                <div>Essai gratuit</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col bg-background overflow-y-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPage('register')}
              className="shrink-0"
              aria-label="Retour"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <div>
              <h1 className="text-lg font-serif font-bold text-[#1B3A5C]">Créer ma paroisse</h1>
              <p className="text-xs text-muted-foreground">Étape {currentStep} sur 2</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  currentStep === step.id
                    ? 'bg-[#1B3A5C] text-white'
                    : currentStep > step.id
                      ? 'bg-green-100 text-green-700'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="size-3" />
                ) : (
                  step.id
                )}
                <span className="hidden sm:inline">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form content */}
        <div className="flex-1 flex items-start justify-center p-4 sm:p-6 md:p-8">
          <div className="w-full max-w-xl">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-xl font-serif font-bold text-[#1B3A5C] mb-1">
                      Votre compte administrateur
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Ces informations vous identifieront comme administrateur de la paroisse
                    </p>
                  </div>

                  {/* Name fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        placeholder="Pierre"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        placeholder="Diouf"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email professionnel *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="pere.diouf@paroisse.sn"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>

                  {/* Phone + Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+221 77 123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Rôle</Label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger id="role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN_PAROISSE">Curé</SelectItem>
                          <SelectItem value="ABBE">Vicaire</SelectItem>
                          <SelectItem value="ADMIN_PAROISSE">Administrateur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                      {/* Password strength indicator */}
                      {password && (
                        <div className="space-y-1">
                          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${passwordStrength.color}`}
                              initial={{ width: 0 }}
                              animate={{ width: passwordStrength.width }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                          <p className={`text-xs ${
                            passwordStrength.score >= 3
                              ? 'text-green-600'
                              : passwordStrength.score >= 2
                                ? 'text-orange-600'
                                : 'text-red-600'
                          }`}>
                            {passwordStrength.label}
                          </p>
                        </div>
                      )}
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

                  {/* Next button */}
                  <div className="pt-4">
                    <Button
                      onClick={() => {
                        if (validateStep1()) setCurrentStep(2)
                      }}
                      className="w-full bg-[#1B3A5C] hover:bg-[#15304d] text-white gap-2"
                      size="lg"
                    >
                      Suivant
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-xl font-serif font-bold text-[#1B3A5C] mb-1">
                      Informations de la paroisse
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Ces informations seront visibles sur la page publique de votre paroisse
                    </p>
                  </div>

                  {/* Church Name */}
                  <div className="space-y-2">
                    <Label htmlFor="churchName">Nom de la paroisse *</Label>
                    <Input
                      id="churchName"
                      placeholder="Paroisse Saint Jean Apôtre"
                      value={churchName}
                      onChange={(e) => setChurchName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Slug */}
                  <div className="space-y-2">
                    <Label>URL de la paroisse</Label>
                    <div className="flex items-center gap-0">
                      <div className="flex items-center h-10 px-3 bg-muted border border-r-0 border-input rounded-l-md text-sm text-muted-foreground whitespace-nowrap">
                        mychurch.com/p/
                      </div>
                      <div className="relative flex-1">
                        <Input
                          value={slug}
                          onChange={(e) => {
                            handleSlugChange(e.target.value)
                            setSlugManuallyEdited(true)
                          }}
                          placeholder="saint-jean"
                          className="rounded-l-none pr-16"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={handleSlugEdit}
                            className="text-muted-foreground hover:text-foreground p-0.5 transition-colors"
                            aria-label="Modifier l'identifiant"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          {slugChecking && (
                            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                          )}
                          {!slugChecking && slugAvailable === true && slug.length >= 3 && (
                            <Check className="size-3.5 text-green-500" />
                          )}
                          {!slugChecking && slugAvailable === false && (
                            <X className="size-3.5 text-red-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    {slugAvailable === false && (
                      <p className="text-xs text-red-600">Cet identifiant est déjà utilisé par une autre paroisse</p>
                    )}
                    {slugAvailable === true && slug.length >= 3 && (
                      <p className="text-xs text-green-600">✓ Identifiant disponible</p>
                    )}
                  </div>

                  {/* Diocese + Country */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="diocese">Diocèse</Label>
                      <Input
                        id="diocese"
                        placeholder="Archidiocèse de Dakar"
                        value={diocese}
                        onChange={(e) => setDiocese(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Pays *</Label>
                      <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger id="country">
                          <SelectValue placeholder="Sélectionnez un pays" />
                        </SelectTrigger>
                        <SelectContent>
                          {AFRICAN_COUNTRIES.map((c) => (
                            <SelectItem key={c.value} value={c.label}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* City + Number of faithful */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Ville *</Label>
                      <Input
                        id="city"
                        placeholder="Dakar"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="faithful">Nombre de fidèles</Label>
                      <Input
                        id="faithful"
                        type="number"
                        placeholder="500"
                        value={numberOfFaithful}
                        onChange={(e) => setNumberOfFaithful(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse complète</Label>
                    <Input
                      id="address"
                      placeholder="123 Avenue de la Paix, Dakar, Sénégal"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  {/* Logo upload */}
                  <div className="space-y-2">
                    <Label>Logo de la paroisse</Label>
                    <div className="border-2 border-dashed border-input rounded-lg p-6 text-center cursor-pointer hover:border-[#1B3A5C]/30 hover:bg-muted/30 transition-all">
                      <Upload className="size-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Glissez-déposez votre logo ici
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG ou SVG (max 2 Mo)
                      </p>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="terms"
                        checked={acceptTerms}
                        onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                      />
                      <Label htmlFor="terms" className="text-sm font-normal leading-snug cursor-pointer">
                        J&apos;accepte les{' '}
                        <span className="text-[#1B3A5C] underline cursor-pointer">
                          conditions d&apos;utilisation
                        </span>
                      </Label>
                    </div>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="privacy"
                        checked={acceptPrivacy}
                        onCheckedChange={(checked) => setAcceptPrivacy(checked === true)}
                      />
                      <Label htmlFor="privacy" className="text-sm font-normal leading-snug cursor-pointer">
                        J&apos;accepte la{' '}
                        <span className="text-[#1B3A5C] underline cursor-pointer">
                          politique de confidentialité
                        </span>
                      </Label>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="gap-2"
                      size="lg"
                    >
                      <ArrowLeft className="size-4" />
                      Retour
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="bg-[#C9A84C] hover:bg-[#B8973B] text-[#1B3A5C] font-semibold gap-2"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Création...
                        </>
                      ) : (
                        <>
                          Créer ma paroisse
                          <ArrowRight className="size-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
    </div>
  )
}
