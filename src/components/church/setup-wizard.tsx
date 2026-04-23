'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Church, User, CreditCard, Smartphone, CheckCircle2,
  ArrowRight, ArrowLeft, Upload, TestTube, Wifi,
  Globe, Monitor, Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'

const steps = [
  { id: 1, title: 'Compte Admin', icon: User, description: 'Créez votre compte administrateur' },
  { id: 2, title: 'Paroisse', icon: Church, description: 'Configurez les informations de votre paroisse' },
  { id: 3, title: 'Paiement', icon: CreditCard, description: 'Configurez les méthodes de paiement' },
  { id: 4, title: 'Déploiement', icon: Smartphone, description: 'Accédez à vos applications' },
  { id: 5, title: 'Confirmation', icon: CheckCircle2, description: 'Finalisez la configuration' },
]

export function SetupWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const { setPage } = useAppStore()
  const [isComplete, setIsComplete] = useState(false)

  // Form state
  const [adminForm, setAdminForm] = useState({
    email: '', password: '', firstName: '', lastName: '', phone: ''
  })
  const [churchForm, setChurchForm] = useState({
    name: 'Paroisse Saint Jean Apôtre',
    address: '', phone: '', email: '', diocese: '', motto: '', numberOfFaithful: '500',
    logoUrl: '', photoUrl: ''
  })
  const [paymentForm, setPaymentForm] = useState({
    orangeMoneyApiKey: '', orangeMoneySecret: '', orangeMoneyMerchantId: '',
    mpesaConsumerKey: '', mpesaSecret: '', mpesaPasskey: '', mpesaShortcode: ''
  })
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')

  const progress = (currentStep / steps.length) * 100

  const nextStep = () => setCurrentStep(Math.min(currentStep + 1, steps.length))
  const prevStep = () => setCurrentStep(Math.max(currentStep - 1, 1))

  const handleComplete = () => {
    setIsComplete(true)
    setTimeout(() => {
      setPage('dashboard')
    }, 3000)
  }

  const testPaymentConnection = () => {
    setTestStatus('testing')
    setTimeout(() => {
      setTestStatus('success')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B3A5C] via-[#2A4F7F] to-[#1B3A5C] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Church className="size-10 text-[#C9A84C]" />
            <h1 className="text-3xl font-serif font-bold text-white">My Church</h1>
          </div>
          <p className="text-white/70">Configurez votre paroisse en quelques étapes</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2 bg-white/10" />
          <div className="flex justify-between mt-3">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center gap-1 ${
                  currentStep >= step.id ? 'text-white' : 'text-white/30'
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                  currentStep > step.id
                    ? 'bg-[#C9A84C] text-[#1B3A5C]'
                    : currentStep === step.id
                      ? 'bg-white text-[#1B3A5C]'
                      : 'bg-white/10 text-white/30'
                }`}>
                  {currentStep > step.id ? <CheckCircle2 className="size-5" /> : step.id}
                </div>
                <span className="text-[10px] hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-2xl border-0">
              {/* Step 1: Admin Account */}
              {currentStep === 1 && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="size-5 text-primary" />
                      Compte Administrateur
                    </CardTitle>
                    <CardDescription>Créez votre compte pour accéder à la plateforme</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Prénom</Label>
                        <Input
                          placeholder="Pierre"
                          value={adminForm.firstName}
                          onChange={e => setAdminForm({...adminForm, firstName: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Nom</Label>
                        <Input
                          placeholder="Diouf"
                          value={adminForm.lastName}
                          onChange={e => setAdminForm({...adminForm, lastName: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        placeholder="pere.diouf@paroisse.sn"
                        value={adminForm.email}
                        onChange={e => setAdminForm({...adminForm, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Téléphone</Label>
                      <Input
                        placeholder="+221 77 123 4567"
                        value={adminForm.phone}
                        onChange={e => setAdminForm({...adminForm, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Mot de passe</Label>
                      <Input
                        type="password"
                        placeholder="Minimum 8 caractères"
                        value={adminForm.password}
                        onChange={e => setAdminForm({...adminForm, password: e.target.value})}
                      />
                    </div>
                  </CardContent>
                </>
              )}

              {/* Step 2: Church Info */}
              {currentStep === 2 && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Church className="size-5 text-primary" />
                      Informations de la Paroisse
                    </CardTitle>
                    <CardDescription>Renseignez les informations de votre paroisse</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Nom de la paroisse</Label>
                      <Input
                        value={churchForm.name}
                        onChange={e => setChurchForm({...churchForm, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Adresse</Label>
                      <Input
                        placeholder="123 Avenue de la Paix, Dakar"
                        value={churchForm.address}
                        onChange={e => setChurchForm({...churchForm, address: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Téléphone</Label>
                        <Input
                          placeholder="+221 33 123 4567"
                          value={churchForm.phone}
                          onChange={e => setChurchForm({...churchForm, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          placeholder="contact@paroisse.sn"
                          value={churchForm.email}
                          onChange={e => setChurchForm({...churchForm, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Diocèse</Label>
                        <Input
                          placeholder="Archidiocèse de Dakar"
                          value={churchForm.diocese}
                          onChange={e => setChurchForm({...churchForm, diocese: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Nombre de fidèles</Label>
                        <Input
                          type="number"
                          value={churchForm.numberOfFaithful}
                          onChange={e => setChurchForm({...churchForm, numberOfFaithful: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Devise</Label>
                      <Input
                        placeholder="Unité, Foi, Charité"
                        value={churchForm.motto}
                        onChange={e => setChurchForm({...churchForm, motto: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Logo</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                          <Upload className="size-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">Cliquez ou glissez</p>
                        </div>
                      </div>
                      <div>
                        <Label>Photo de l&apos;église</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                          <Upload className="size-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">Cliquez ou glissez</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </>
              )}

              {/* Step 3: Payment Config */}
              {currentStep === 3 && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="size-5 text-primary" />
                      Configuration des Paiements
                    </CardTitle>
                    <CardDescription>Configurez les méthodes de paiement pour recevoir les dons</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Orange Money */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">OM</span>
                        </div>
                        <h3 className="font-semibold">Orange Money</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-3 pl-10">
                        <div>
                          <Label className="text-xs">API Key</Label>
                          <Input placeholder="Votre clé API" value={paymentForm.orangeMoneyApiKey} onChange={e => setPaymentForm({...paymentForm, orangeMoneyApiKey: e.target.value})} />
                        </div>
                        <div>
                          <Label className="text-xs">Secret Key</Label>
                          <Input type="password" placeholder="Votre secret" value={paymentForm.orangeMoneySecret} onChange={e => setPaymentForm({...paymentForm, orangeMoneySecret: e.target.value})} />
                        </div>
                        <div>
                          <Label className="text-xs">Merchant ID</Label>
                          <Input placeholder="ID marchand" value={paymentForm.orangeMoneyMerchantId} onChange={e => setPaymentForm({...paymentForm, orangeMoneyMerchantId: e.target.value})} />
                        </div>
                      </div>
                    </div>

                    {/* M-Pesa */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">MP</span>
                        </div>
                        <h3 className="font-semibold">M-Pesa</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pl-10">
                        <div>
                          <Label className="text-xs">Consumer Key</Label>
                          <Input placeholder="Consumer key" value={paymentForm.mpesaConsumerKey} onChange={e => setPaymentForm({...paymentForm, mpesaConsumerKey: e.target.value})} />
                        </div>
                        <div>
                          <Label className="text-xs">Secret</Label>
                          <Input type="password" placeholder="Secret" value={paymentForm.mpesaSecret} onChange={e => setPaymentForm({...paymentForm, mpesaSecret: e.target.value})} />
                        </div>
                        <div>
                          <Label className="text-xs">Passkey</Label>
                          <Input placeholder="Passkey" value={paymentForm.mpesaPasskey} onChange={e => setPaymentForm({...paymentForm, mpesaPasskey: e.target.value})} />
                        </div>
                        <div>
                          <Label className="text-xs">Shortcode</Label>
                          <Input placeholder="Shortcode" value={paymentForm.mpesaShortcode} onChange={e => setPaymentForm({...paymentForm, mpesaShortcode: e.target.value})} />
                        </div>
                      </div>
                    </div>

                    {/* Test button */}
                    <div className="flex items-center gap-3 pl-10">
                      <Button
                        variant="outline"
                        onClick={testPaymentConnection}
                        disabled={testStatus === 'testing'}
                        className="gap-2"
                      >
                        <TestTube className="size-4" />
                        {testStatus === 'testing' ? 'Test en cours...' : 'Tester la connexion'}
                      </Button>
                      {testStatus === 'success' && (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <Wifi className="size-3 mr-1" /> Connexion réussie !
                        </Badge>
                      )}
                      {testStatus === 'error' && (
                        <Badge variant="destructive">Échec de connexion</Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground pl-10">
                      Vous pouvez configurer les paiements plus tard dans les paramètres.
                    </p>
                  </CardContent>
                </>
              )}

              {/* Step 4: Deployment */}
              {currentStep === 4 && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="size-5 text-primary" />
                      Déploiement des Applications
                    </CardTitle>
                    <CardDescription>Accédez à votre plateforme sur tous les supports</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Web App */}
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30">
                        <Globe className="size-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-800 dark:text-green-300">Application Web</h4>
                        <p className="text-sm text-green-600 dark:text-green-400">Accessible dès maintenant</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-green-200">✓ Active</Badge>
                    </div>

                    {/* Mobile App */}
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                        <Smartphone className="size-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-300">Application Mobile</h4>
                        <p className="text-sm text-blue-600 dark:text-blue-400">iOS &amp; Android - Plan Premium</p>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-xs text-center p-1">
                          QR Code<br/>App Store
                        </div>
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-xs text-center p-1">
                          QR Code<br/>Google Play
                        </div>
                      </div>
                    </div>

                    {/* Desktop App */}
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                        <Monitor className="size-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-purple-800 dark:text-purple-300">Application Desktop</h4>
                        <p className="text-sm text-purple-600 dark:text-purple-400">Windows &amp; Mac</p>
                      </div>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Download className="size-3" /> .exe
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}

              {/* Step 5: Confirmation */}
              {currentStep === 5 && !isComplete && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="size-5 text-primary" />
                      Confirmation
                    </CardTitle>
                    <CardDescription>Vérifiez les informations avant de finaliser</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-xs text-muted-foreground mb-1">Administrateur</p>
                        <p className="font-medium">{adminForm.firstName || 'Pierre'} {adminForm.lastName || 'Diouf'}</p>
                        <p className="text-sm text-muted-foreground">{adminForm.email || 'pere.diouf@paroisse.sn'}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-xs text-muted-foreground mb-1">Paroisse</p>
                        <p className="font-medium">{churchForm.name}</p>
                        <p className="text-sm text-muted-foreground">{churchForm.address || 'Dakar, Sénégal'}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-xs text-muted-foreground mb-1">Paiement</p>
                        <p className="font-medium">
                          {paymentForm.orangeMoneyApiKey ? 'Orange Money ✓' : 'Orange Money (à configurer)'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {paymentForm.mpesaConsumerKey ? 'M-Pesa ✓' : 'M-Pesa (à configurer)'}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-xs text-muted-foreground mb-1">Applications</p>
                        <p className="font-medium">Web ✓</p>
                        <p className="text-sm text-muted-foreground">Mobile &amp; Desktop disponibles</p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button
                        onClick={handleComplete}
                        className="w-full h-12 text-lg gap-2 bg-[#C9A84C] hover:bg-[#B8973B] text-[#1B3A5C] font-bold"
                      >
                        <Church className="size-5" />
                        Finaliser et lancer ma paroisse
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}

              {/* Completion animation */}
              {currentStep === 5 && isComplete && (
                <CardContent className="py-16 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <CheckCircle2 className="size-20 text-green-500 mx-auto mb-4" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="text-2xl font-serif font-bold mb-2">🎉 Félicitations !</h2>
                    <p className="text-muted-foreground">
                      Votre paroisse est prête. Redirection vers le tableau de bord...
                    </p>
                  </motion.div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        {!isComplete && (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="size-4" />
              Précédent
            </Button>
            {currentStep < steps.length && (
              <Button
                onClick={nextStep}
                className="gap-2 bg-[#C9A84C] hover:bg-[#B8973B] text-[#1B3A5C] font-semibold"
              >
                Suivant
                <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
