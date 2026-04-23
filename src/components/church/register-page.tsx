'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Church, User, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'

export default function RegisterPage() {
  const { setPage } = useAppStore()

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background with subtle cross pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1B3A5C] via-[#1f4570] to-[#1B3A5C]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Crect x='27' y='0' width='6' height='60'/%3E%3Crect x='0' y='27' width='60' height='6'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative circles */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#C9A84C]/5 blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-white/3 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-3"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/15 text-white">
            <Church className="size-7" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-white">My Church</h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-white/60 mb-10 text-center text-sm sm:text-base"
        >
          Rejoignez la première plateforme digitale pour paroisses catholiques
        </motion.p>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-xl sm:text-2xl font-serif font-bold text-white mb-8 text-center"
        >
          Comment souhaitez-vous commencer ?
        </motion.h2>

        {/* Two cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl w-full">
          {/* Card 1: Parish */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card
              className="border-0 shadow-2xl bg-white cursor-pointer group hover:shadow-[#C9A84C]/20 hover:shadow-2xl transition-all duration-300 h-full"
              onClick={() => setPage('register-church')}
            >
              <CardContent className="p-6 sm:p-8 flex flex-col items-center text-center h-full">
                <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1B3A5C] to-[#2A4F7F] text-white mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Church className="size-10" />
                </div>

                <h3 className="text-xl font-serif font-bold text-[#1B3A5C] mb-2">
                  JE SUIS UNE PAROISSE
                </h3>
                <span className="text-2xl mb-3">⛪</span>
                <p className="text-muted-foreground text-sm mb-6 flex-1">
                  Je suis curé ou administrateur et je souhaite créer l&apos;espace digital de ma paroisse
                </p>

                <Button
                  className="w-full bg-[#1B3A5C] hover:bg-[#15304d] text-white gap-2 group-hover:bg-[#C9A84C] group-hover:text-[#1B3A5C] transition-colors duration-300"
                  size="lg"
                >
                  Créer ma paroisse
                  <ArrowRight className="size-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2: Faithful */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card
              className="border-0 shadow-2xl bg-white cursor-pointer group hover:shadow-[#C9A84C]/20 hover:shadow-2xl transition-all duration-300 h-full"
              onClick={() => setPage('church-search')}
            >
              <CardContent className="p-6 sm:p-8 flex flex-col items-center text-center h-full">
                <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C9A84C] to-[#d4b85e] text-white mb-5 group-hover:scale-110 transition-transform duration-300">
                  <User className="size-10" />
                </div>

                <h3 className="text-xl font-serif font-bold text-[#1B3A5C] mb-2">
                  JE SUIS UN FIDÈLE
                </h3>
                <span className="text-2xl mb-3">👤</span>
                <p className="text-muted-foreground text-sm mb-6 flex-1">
                  Je veux rejoindre ma paroisse en ligne pour suivre les actualités et les activités
                </p>

                <Button
                  className="w-full bg-[#C9A84C] hover:bg-[#B8973B] text-[#1B3A5C] gap-2 font-semibold"
                  size="lg"
                >
                  Trouver ma paroisse
                  <ArrowRight className="size-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 text-center"
        >
          <p className="text-white/50 text-sm">
            Déjà un compte ?{' '}
            <button
              onClick={() => setPage('login')}
              className="text-[#C9A84C] hover:text-[#d4b85e] font-medium underline underline-offset-2 transition-colors"
            >
              Se connecter
            </button>
          </p>
        </motion.div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 py-4 text-center">
        <p className="text-white/30 text-xs">
          © {new Date().getFullYear()} My Church — Made with ❤️ in Africa
        </p>
      </div>
    </div>
  )
}
