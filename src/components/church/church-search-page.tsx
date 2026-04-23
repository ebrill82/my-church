'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Church, MapPin, Users, ArrowLeft, ChevronDown,
  ChevronRight, Link as LinkIcon, UserPlus, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore, type Church } from '@/lib/store'
import { toast } from 'sonner'

interface SearchResult {
  id: string
  name: string
  slug: string
  city: string
  country: string
  address: string
  phone: string
  email: string
  logoUrl: string | null
  numberOfFaithful: number | null
  plan: string | null
  _count: { users: number }
}

export default function ChurchSearchPage() {
  const { setPage, setSelectedChurch } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [groupedResults, setGroupedResults] = useState<Record<string, SearchResult[]>>({})
  const [searching, setSearching] = useState(false)
  const [expandedCountries, setExpandedCountries] = useState<Record<string, boolean>>({})
  const [invitationLink, setInvitationLink] = useState('')

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      // Load all churches on mount
      loadAllChurches()
      return
    }

    setSearching(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/churches/search?q=${encodeURIComponent(searchQuery)}`)
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data.churches)
          setGroupedResults(data.grouped)
        }
      } catch {
        // Silently fail
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const loadAllChurches = useCallback(async () => {
    setSearching(true)
    try {
      const res = await fetch('/api/churches/search')
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data.churches)
        setGroupedResults(data.grouped)
      }
    } catch {
      // Silently fail
    } finally {
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    loadAllChurches()
  }, [loadAllChurches])

  const toggleCountry = (country: string) => {
    setExpandedCountries((prev) => ({ ...prev, [country]: !prev[country] }))
  }

  const handleJoinChurch = (church: SearchResult) => {
    setSelectedChurch({
      id: church.id,
      name: church.name,
      slug: church.slug,
      address: church.address,
      phone: church.phone,
      email: church.email,
      logoUrl: church.logoUrl || undefined,
      numberOfFaithful: church.numberOfFaithful || undefined,
      plan: church.plan || undefined,
      city: church.city,
      country: church.country,
    })
    setPage('register-faithful')
  }

  const handleInvitationLink = () => {
    if (!invitationLink.trim()) {
      toast.error('Veuillez coller un lien d\'invitation')
      return
    }
    // Try to extract slug from invitation link
    const slugMatch = invitationLink.match(/\/p\/([a-z0-9-]+)/)
    if (slugMatch) {
      toast.info('Redirection vers la paroisse...')
      // In a real app, would fetch church by slug
    } else {
      toast.error('Lien d\'invitation invalide')
    }
  }

  const countries = Object.keys(groupedResults).sort()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B3A5C] via-[#1f4570] to-[#1B3A5C] relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Crect x='27' y='0' width='6' height='60'/%3E%3Crect x='0' y='27' width='60' height='6'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="p-4 sm:p-6">
          <div className="max-w-3xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage('register')}
              className="text-white/60 hover:text-white hover:bg-white/10 gap-1 mb-6"
            >
              <ArrowLeft className="size-4" />
              Retour
            </Button>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <Church className="size-12 text-[#C9A84C] mx-auto mb-4" />
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
                REJOINDRE VOTRE PAROISSE
              </h1>
              <p className="text-white/60 text-sm sm:text-base">
                Trouvez votre paroisse et créez votre compte pour accéder à l&apos;espace fidèle
              </p>
            </motion.div>

            {/* Search bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative mb-6"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-white/40" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Recherchez votre paroisse..."
                className="pl-12 h-12 bg-white/10 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-[#C9A84C]/50 text-base"
              />
              {searching && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 size-5 animate-spin text-[#C9A84C]" />
              )}
            </motion.div>

            {/* Invitation link section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mb-8"
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <LinkIcon className="size-4 text-[#C9A84C]" />
                    <span className="text-white/80 text-sm font-medium">
                      Vous avez reçu un lien d&apos;invitation ?
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={invitationLink}
                      onChange={(e) => setInvitationLink(e.target.value)}
                      placeholder="Collez le lien d'invitation ici..."
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#C9A84C]/50 text-sm"
                    />
                    <Button
                      onClick={handleInvitationLink}
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 shrink-0"
                    >
                      Rejoindre
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Country groups */}
            {!searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <p className="text-white/50 text-sm mb-4 flex items-center gap-2">
                  <MapPin className="size-4" />
                  OU parcourez les paroisses par pays :
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Results area */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-8">
          {searchQuery && searchResults.length === 0 && !searching && (
            <div className="text-center py-12">
              <Search className="size-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/50 text-lg font-medium">Aucune paroisse trouvée</p>
              <p className="text-white/30 text-sm mt-1">
                Essayez un autre terme de recherche ou parcourez par pays
              </p>
            </div>
          )}

          {/* Search results (flat list when searching) */}
          {searchQuery && searchResults.length > 0 && (
            <div className="space-y-3">
              {searchResults.map((church, idx) => (
                <motion.div
                  key={church.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <ChurchCard church={church} onJoin={handleJoinChurch} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Country groups (when not searching) */}
          {!searchQuery && countries.length > 0 && (
            <div className="space-y-2">
              {countries.map((country) => {
                const churches = groupedResults[country]
                const isExpanded = expandedCountries[country] !== false // default expanded

                return (
                  <Card key={country} className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden">
                    <button
                      onClick={() => toggleCountry(country)}
                      className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="size-4 text-[#C9A84C]" />
                        <span className="text-white font-medium">{country}</span>
                        <Badge className="bg-[#C9A84C]/20 text-[#C9A84C] border-0 text-xs">
                          {churches.length} paroisse{churches.length > 1 ? 's' : ''}
                        </Badge>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="size-4 text-white/40" />
                      ) : (
                        <ChevronRight className="size-4 text-white/40" />
                      )}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-3">
                            {churches.map((church) => (
                              <ChurchCard
                                key={church.id}
                                church={church}
                                onJoin={handleJoinChurch}
                                compact
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                )
              })}
            </div>
          )}

          {!searchQuery && countries.length === 0 && !searching && (
            <div className="text-center py-12">
              <Church className="size-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/50 text-lg font-medium">Aucune paroisse enregistrée</p>
              <p className="text-white/30 text-sm mt-1">
                Les paroisses apparaîtront ici une fois enregistrées
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Church Card Component ─────────────────────────────────────

function ChurchCard({
  church,
  onJoin,
  compact = false,
}: {
  church: SearchResult
  onJoin: (church: SearchResult) => void
  compact?: boolean
}) {
  return (
    <Card className={`bg-white border-0 shadow-sm hover:shadow-md transition-shadow ${compact ? '' : ''}`}>
      <CardContent className={compact ? 'p-3' : 'p-4'}>
        <div className="flex items-start gap-3">
          {/* Church icon */}
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#1B3A5C] text-white shrink-0">
            {church.logoUrl ? (
              <img src={church.logoUrl} alt={church.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <Church className="size-5 sm:size-6" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-serif font-bold text-[#1B3A5C] text-sm sm:text-base truncate">
              {church.name}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
              {church.city && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="size-3" />
                  {church.city}
                </span>
              )}
              {church.numberOfFaithful && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="size-3" />
                  {church.numberOfFaithful} fidèles
                </span>
              )}
              {church._count.users > 0 && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="size-3" />
                  {church._count.users} membres
                </span>
              )}
            </div>
          </div>

          {/* Join button */}
          <Button
            onClick={() => onJoin(church)}
            size={compact ? 'sm' : 'default'}
            className="bg-[#C9A84C] hover:bg-[#B8973B] text-[#1B3A5C] font-semibold gap-1 shrink-0"
          >
            <UserPlus className="size-3.5" />
            <span className="hidden sm:inline">Rejoindre</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
