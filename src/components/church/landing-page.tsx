'use client'

import React, { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Church,
  Menu,
  X,
  Calendar,
  Users,
  Clock,
  CreditCard,
  UsersRound,
  ScrollText,
  Check,
  Star,
  Shield,
  Zap,
  Globe,
  Heart,
  ArrowRight,
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  Play,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { useAppStore } from '@/lib/store'

// ─── Animation helpers ────────────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

// ─── Section wrapper with scroll-triggered animation ──────────────────

function AnimatedSection({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.section>
  )
}

// ─── Decorative SVG background element ────────────────────────────────

function CrossDecoration({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="52" y="10" width="16" height="100" rx="3" fill="currentColor" opacity="0.06" />
      <rect x="20" y="38" width="80" height="16" rx="3" fill="currentColor" opacity="0.06" />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export default function LandingPage() {
  const { setAuthModal, setPage } = useAppStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [annualPricing, setAnnualPricing] = useState(false)

  // ─── Navigation links ─────────────────────────────────────────────
  const navLinks = [
    { label: 'Fonctionnalités', href: '#features' },
    { label: 'Tarifs', href: '#pricing' },
    { label: 'Témoignages', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' },
  ]

  // ─── Feature cards data ───────────────────────────────────────────
  const features = [
    {
      icon: Calendar,
      title: 'Gestion des Activités',
      description: 'Calendrier intelligent, récurrences, rappels automatiques',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      icon: Users,
      title: 'Gestion des Fidèles',
      description: 'Annuaire digital, fiches détaillées, import/export',
      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    {
      icon: Clock,
      title: 'Prise de Rendez-vous',
      description: 'Créneaux automatiques, confirmations, rappels',
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    },
    {
      icon: CreditCard,
      title: 'Dons en Ligne',
      description: 'Orange Money, M-Pesa, Stripe, reçus automatiques',
      color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    },
    {
      icon: UsersRound,
      title: 'Groupes & Communautés',
      description: 'Chorale, scouts, jeunes, chat intégré',
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    },
    {
      icon: ScrollText,
      title: 'Certificats',
      description: 'Baptême, confirmation, mariage, génération PDF',
      color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    },
  ]

  // ─── Before/After data ────────────────────────────────────────────
  const beforeItems = [
    'Registres papier perdus',
    'Dons en espèces non tracés',
    'Calendriers affichés seulement à l\'église',
    'Communications limitées au dimanche',
  ]
  const afterItems = [
    'Base de données sécurisée dans le cloud',
    'Dons en ligne Orange Money, M-Pesa, Stripe',
    'Calendrier digital accessible 24h/24',
    'Notifications en temps réel',
  ]

  // ─── Pricing data ─────────────────────────────────────────────────
  const pricingPlans = [
    {
      icon: '🌱',
      name: 'GRATUIT',
      monthlyPrice: 0,
      annualPrice: 0,
      description: 'Pour découvrir la plateforme',
      badge: null,
      features: [
        '50 fidèles',
        '1 admin',
        '1 groupe',
        'Calendrier 7 jours',
      ],
      cta: 'Commencer gratuitement',
      ctaAction: () => setAuthModal(true, 'register'),
      highlighted: false,
    },
    {
      icon: '🌿',
      name: 'STANDARD',
      monthlyPrice: 50,
      annualPrice: 500,
      description: 'Pour les paroisses en croissance',
      badge: 'LE PLUS POPULAIRE',
      features: [
        '1 000 fidèles',
        '5 admins',
        '10 groupes',
        'Calendrier illimité',
        'Export données',
        'Dashboard stats',
      ],
      cta: 'Essai gratuit 14 jours',
      ctaAction: () => setAuthModal(true, 'register'),
      highlighted: true,
    },
    {
      icon: '🌳',
      name: 'PREMIUM',
      monthlyPrice: 100,
      annualPrice: 1000,
      description: 'Pour les grandes paroisses',
      badge: 'MEILLEUR RAPPORT',
      features: [
        'TOUT ILLIMITÉ',
        'Livestream',
        'Bibliothèque sermons',
        'SMS / WhatsApp',
        'App mobile white label',
      ],
      cta: 'Essai gratuit 14 jours',
      ctaAction: () => setAuthModal(true, 'register'),
      highlighted: false,
    },
    {
      icon: '⛪',
      name: 'DIOCÈSE',
      monthlyPrice: 1000,
      annualPrice: 10000,
      description: 'Pour les diocèses et groupements',
      badge: null,
      features: [
        '100 paroisses',
        'Gestion centralisée',
        'Formation présentielle',
        'Développements sur mesure',
      ],
      cta: 'Nous contacter',
      ctaAction: () => setPage('landing'),
      highlighted: false,
    },
  ]

  // ─── Testimonials data ────────────────────────────────────────────
  const testimonials = [
    {
      quote:
        'My Church a transformé la gestion de notre paroisse. Les dons en ligne via Orange Money ont triplé nos recettes.',
      author: 'Père Jean-Baptiste Ouédraogo',
      title: 'Curé',
      church: 'Paroisse Saint Paul, Ouagadougou',
      rating: 5,
    },
    {
      quote:
        'L\'agenda digital et les rappels par SMS ont réduit les absences aux rendez-vous de 60%.',
      author: 'Père Augustin Diallo',
      title: 'Curé',
      church: 'Paroisse Notre Dame, Abidjan',
      rating: 5,
    },
    {
      quote:
        'La génération automatique des certificats nous fait gagner 10 heures par semaine.',
      author: 'Abbé François Mbeki',
      title: 'Vicaire',
      church: 'Paroisse Saint Pierre, Douala',
      rating: 5,
    },
  ]

  // ─── FAQ data ─────────────────────────────────────────────────────
  const faqs = [
    {
      question: 'Comment fonctionne l\'essai gratuit ?',
      answer:
        'L\'essai gratuit dure 14 jours, sans carte bancaire. Vous avez accès à toutes les fonctionnalités du plan Premium pendant cette période.',
    },
    {
      question: 'Quels moyens de paiement acceptez-vous ?',
      answer:
        'Nous acceptons les paiements par carte bancaire (Stripe), Orange Money et M-Pesa pour les paiements mobiles en Afrique.',
    },
    {
      question: 'Mes données sont-elles sécurisées ?',
      answer:
        'Absolument. Vos données sont chiffrées, sauvegardées quotidiennement, et hébergées sur des serveurs sécurisés conformes au RGPD.',
    },
    {
      question: 'Puis-je changer de plan à tout moment ?',
      answer:
        'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Le prorata sera calculé automatiquement.',
    },
    {
      question: 'Comment configurer les paiements Orange Money ?',
      answer:
        'Simple ! Dans les paramètres, entrez votre clé API et votre merchant ID Orange Money. Notre assistant vous guide étape par étape.',
    },
    {
      question: 'Y a-t-il une application mobile ?',
      answer:
        'Oui ! Avec le plan Premium, vous obtenez une application mobile personnalisée (white label) pour votre paroisse, disponible sur iOS et Android.',
    },
  ]

  // ─── Footer columns data ──────────────────────────────────────────
  const footerColumns = [
    {
      title: 'Produit',
      links: ['Fonctionnalités', 'Tarifs', 'Démo', 'Mises à jour'],
    },
    {
      title: 'Entreprise',
      links: ['À propos', 'Blog', 'Carrières', 'Presse'],
    },
    {
      title: 'Support',
      links: ['Centre d\'aide', 'Documentation', 'Status', 'Contact'],
    },
    {
      title: 'Légal',
      links: ['Confidentialité', 'CGU', 'Cookies', 'RGPD'],
    },
  ]

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* ─── HEADER / NAV ─────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage('landing')}>
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
                <Church className="size-5" />
              </div>
              <span className="font-serif text-xl font-bold tracking-tight">My Church</span>
            </div>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop CTA buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAuthModal(true, 'login')}
              >
                Se connecter
              </Button>
              <Button
                size="sm"
                onClick={() => setAuthModal(true, 'register')}
              >
                Commencer gratuitement
              </Button>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pb-4 border-t border-border/50 mt-2"
            >
              <div className="flex flex-col gap-3 pt-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAuthModal(true, 'login')
                      setMobileMenuOpen(false)
                    }}
                  >
                    Se connecter
                  </Button>
                  <Button
                    onClick={() => {
                      setAuthModal(true, 'register')
                      setMobileMenuOpen(false)
                    }}
                  >
                    Commencer gratuitement
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </nav>
      </header>

      {/* ─── HERO SECTION ──────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <img
            src="/church-hero.png"
            alt="Intérieur d'église"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1B3A5C]/95 via-[#1B3A5C]/85 to-[#1B3A5C]/70" />
        </div>

        {/* Decorative elements */}
        <CrossDecoration className="absolute top-24 left-8 text-white/10 hidden lg:block" />
        <CrossDecoration className="absolute bottom-32 right-12 text-[#C9A84C]/20 hidden lg:block" />
        <CrossDecoration className="absolute top-1/3 right-1/4 text-white/10 hidden xl:block" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center"
          >
            {/* Badge */}
            <motion.div variants={staggerItem} className="mb-6">
              <Badge className="text-sm px-4 py-1.5 font-medium bg-[#C9A84C]/20 text-[#C9A84C] border-[#C9A84C]/30">
                <Zap className="size-3.5 mr-1.5" />
                Plateforme N°1 pour paroisses catholiques
              </Badge>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={staggerItem}
              className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6 text-white"
            >
              Connectez votre
              <br />
              <span className="text-[#C9A84C]">paroisse</span> au monde{' '}
              <span className="text-white/90">digital</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={staggerItem}
              className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              La plateforme tout-en-un pour gérer votre paroisse, engager vos fidèles et faciliter
              les dons en ligne.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              variants={staggerItem}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Button
                size="lg"
                className="text-base px-8 h-12 bg-[#C9A84C] hover:bg-[#B8973B] text-[#1B3A5C] font-semibold"
                onClick={() => setAuthModal(true, 'register')}
              >
                Démarrer l&apos;essai gratuit
                <ArrowRight className="size-4 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="text-base px-8 h-12 border-white/30 text-white hover:bg-white/10">
                <Play className="size-4 mr-2" />
                Voir la démo
              </Button>
            </motion.div>

            {/* Stats bar */}
            <motion.div
              variants={staggerItem}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-3xl mx-auto"
            >
              {[
                { value: '500+', label: 'Paroisses' },
                { value: '100 000+', label: 'Fidèles connectés' },
                { value: '25+', label: 'Pays' },
                { value: '4.9/5', label: 'Satisfaction' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-[#C9A84C]">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/60 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="size-6 text-white/50" />
        </motion.div>
      </section>

      {/* ─── PROBLEMS / BEFORE-AFTER SECTION ───────────────────────── */}
      <AnimatedSection className="py-20 sm:py-28 bg-accent/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} className="text-center mb-14">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
              Finies les contraintes de la <span className="text-primary">gestion manuelle</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Passez d&apos;une gestion fragmentée à une solution digitale complète
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
            {/* Before */}
            <motion.div variants={staggerItem}>
              <Card className="h-full border-destructive/20 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <X className="size-5" />
                    Avant
                  </CardTitle>
                  <CardDescription>La gestion traditionnelle, source de difficultés</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {beforeItems.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <div className="mt-0.5 flex items-center justify-center w-6 h-6 rounded-full bg-destructive/10 text-destructive shrink-0">
                          <X className="size-3.5" />
                        </div>
                        <span className="text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* After */}
            <motion.div variants={staggerItem}>
              <Card className="h-full border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <Check className="size-5" />
                    Après
                  </CardTitle>
                  <CardDescription>La gestion digitale avec My Church</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {afterItems.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <div className="mt-0.5 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 shrink-0">
                          <Check className="size-3.5" />
                        </div>
                        <span className="text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* ─── FEATURES SECTION ──────────────────────────────────────── */}
      <AnimatedSection id="features" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} className="text-center mb-14">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
              Tout ce dont votre <span className="text-primary">paroisse</span> a besoin
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Une suite complète d&apos;outils pensés pour la vie paroissiale
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <motion.div key={feature.title} variants={staggerItem}>
                <Card className="h-full group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <CardContent className="pt-6">
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.color} mb-4`}
                    >
                      <feature.icon className="size-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ─── PRICING SECTION ───────────────────────────────────────── */}
      <AnimatedSection id="pricing" className="py-20 sm:py-28 bg-accent/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
              Choisissez le plan adapté à votre <span className="text-primary">paroisse</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Des tarifs transparents, sans surprise
            </p>

            {/* Monthly/Annual toggle */}
            <div className="flex items-center justify-center gap-3">
              <span
                className={`text-sm font-medium ${!annualPricing ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                Mensuel
              </span>
              <Switch
                checked={annualPricing}
                onCheckedChange={setAnnualPricing}
                aria-label="Basculer entre tarification mensuelle et annuelle"
              />
              <span
                className={`text-sm font-medium ${annualPricing ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                Annuel
              </span>
              {annualPricing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                    Économisez 17%
                  </Badge>
                </motion.div>
              )}
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => (
              <motion.div key={plan.name} variants={staggerItem}>
                <Card
                  className={`h-full flex flex-col relative ${
                    plan.highlighted
                      ? 'border-primary shadow-lg scale-[1.02] sm:scale-105'
                      : ''
                  }`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="whitespace-nowrap shadow-sm">{plan.badge}</Badge>
                    </div>
                  )}

                  <CardHeader className="pb-2">
                    <div className="text-3xl mb-2">{plan.icon}</div>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1">
                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <motion.span
                          key={annualPricing ? 'annual' : 'monthly'}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="font-serif text-4xl font-bold"
                        >
                          ${annualPricing ? plan.annualPrice : plan.monthlyPrice}
                        </motion.span>
                        <span className="text-muted-foreground text-sm">
                          /{annualPricing ? 'an' : 'mois'}
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5">
                          <Check className="size-4 text-primary mt-0.5 shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={plan.highlighted ? 'default' : 'outline'}
                      onClick={plan.ctaAction}
                    >
                      {plan.cta}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ─── TESTIMONIALS SECTION ──────────────────────────────────── */}
      <AnimatedSection id="testimonials" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} className="text-center mb-14">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
              Ce que disent les <span className="text-primary">curés</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Des paroisses à travers l&apos;Afrique nous font confiance
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial) => (
              <motion.div key={testimonial.author} variants={staggerItem}>
                <Card className="h-full">
                  <CardContent className="pt-6">
                    {/* Stars */}
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="size-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>

                    {/* Quote */}
                    <blockquote className="text-sm leading-relaxed mb-6 italic text-foreground/90">
                      &ldquo;{testimonial.quote}&rdquo;
                    </blockquote>

                    {/* Author */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                        <Church className="size-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{testimonial.author}</div>
                        <div className="text-xs text-muted-foreground">{testimonial.church}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ─── FAQ SECTION ───────────────────────────────────────────── */}
      <AnimatedSection id="faq" className="py-20 sm:py-28 bg-accent/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} className="text-center mb-14">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
              Questions <span className="text-primary">fréquentes</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Tout ce que vous devez savoir avant de commencer
            </p>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ─── FINAL CTA SECTION ─────────────────────────────────────── */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 church-gradient" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary" />

        {/* Decorative */}
        <CrossDecoration className="absolute top-8 right-16 text-white/10 hidden lg:block" />
        <CrossDecoration className="absolute bottom-8 left-16 text-white/10 hidden lg:block" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={staggerItem}
              className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4"
            >
              Prêt à digitaliser votre paroisse ?
            </motion.h2>
            <motion.p
              variants={staggerItem}
              className="text-primary-foreground/80 text-lg mb-10 max-w-xl mx-auto"
            >
              Commencez votre essai gratuit de 14 jours aujourd&apos;hui
            </motion.p>

            <motion.div
              variants={staggerItem}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
            >
              <Button
                size="lg"
                variant="secondary"
                className="text-base px-8 h-12 font-semibold"
                onClick={() => setAuthModal(true, 'register')}
              >
                Commencer gratuitement
                <ArrowRight className="size-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 h-12 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                Planifier une démo
              </Button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              variants={staggerItem}
              className="flex flex-wrap items-center justify-center gap-6 text-primary-foreground/70 text-sm"
            >
              <div className="flex items-center gap-2">
                <Shield className="size-4" />
                <span>Sans carte bancaire</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="size-4" />
                <span>Satisfait ou remboursé 30 jours</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="size-4" />
                <span>Support en français</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────────────── */}
      <footer className="bg-foreground/[0.03] border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
            {/* Logo & tagline */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
                  <Church className="size-5" />
                </div>
                <span className="font-serif text-xl font-bold">My Church</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                La plateforme digitale pour les paroisses catholiques
              </p>
            </div>

            {/* Link columns */}
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h4 className="font-semibold text-sm mb-4">{column.title}</h4>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} My Church. Tous droits réservés.</p>
            <p className="flex items-center gap-1">
              Made with <Heart className="size-3.5 text-red-500 fill-red-500" /> in Africa
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
