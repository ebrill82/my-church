# ⛪ MY CHURCH - Gestion Digitale pour Paroisses

Plateforme SaaS complète pour la gestion digitale des paroisses catholiques. Conçue pour l'Afrique francophone et le monde.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🌟 Fonctionnalités

### Gestion Paroissiale
- 👥 **Gestion des fidèles** - Annuaire complet des paroissiens
- 📅 **Calendrier d'activités** - Messes, adorations, confessions, catéchèses
- 🕐 **Prise de rendez-vous** - Réservation avec les abbés
- 👨‍👩‍👧‍👦 **Groupes & Communautés** - Chorale, Scouts, Lecteurs, Jeunes
- 💰 **Finances & Dons** - Orange Money, M-Pesa, Stripe, espèces
- 📜 **Certificats** - Baptême, confirmation, mariage
- ⚰️ **Cimetière** - Concessions et registre des défunts
- 📢 **Communication** - Notifications, emails, SMS

### SaaS & Abonnement
- 🆓 **Gratuit** - $0/mois (50 fidèles, 2 groupes)
- ⭐ **Standard** - $50/mois (200 fidèles, 10 groupes)
- 👑 **Premium** - $100/mois (500 fidèles, 20 groupes) - *Le plus populaire*
- 🏛️ **Diocèse** - $1000/mois (illimité, multi-paroisses)
- 🎁 **Essai gratuit de 14 jours**

---

## 🚀 Installation

### Prérequis

- **Node.js** 18+ ou **Bun** 1.0+
- **Git**

### Étape 1 : Cloner le dépôt

```bash
git clone https://github.com/ebrill82/my-church.git
cd my-church
```

### Étape 2 : Installer les dépendances

```bash
# Avec Bun (recommandé)
bun install

# Ou avec npm
npm install

# Ou avec yarn
yarn install
```

### Étape 3 : Configurer les variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env
```

Éditer le fichier `.env` :

```env
# Base de données SQLite
DATABASE_URL="file:./db/custom.db"

# Clé secrète pour les sessions
NEXTAUTH_SECRET="votre-cle-secrete-ici"

# Stripe (optionnel - pour les paiements)
STRIPE_PUBLIC_KEY=""
STRIPE_SECRET_KEY=""

# Orange Money (optionnel)
ORANGE_MONEY_API_KEY=""
ORANGE_MONEY_SECRET=""

# M-Pesa (optionnel)
MPESA_CONSUMER_KEY=""
MPESA_SECRET=""
```

### Étape 4 : Initialiser la base de données

```bash
# Créer les tables dans la base de données
bun run db:push

# Générer le client Prisma
bun run db:generate
```

### Étape 5 : Charger les données de démonstration

```bash
# Démarrer le serveur
bun run dev

# Dans un autre terminal, charger les données de démo :
curl -X POST http://localhost:3000/api/seed
```

### Étape 6 : Démarrer l'application

```bash
bun run dev
```

L'application est accessible sur **http://localhost:3000**

---

## 🔐 Identifiants de démonstration

Après avoir chargé les données de démo, vous pouvez vous connecter avec :

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin Paroisse | `admin@saintjean.sn` | `password123` |
| Abbé | `pere.mbaye@saintjean.sn` | `password123` |
| Paroissien | `amadou.diop@email.com` | `password123` |

---

## 📁 Structure du projet

```
my-church/
├── prisma/
│   └── schema.prisma          # Schéma de la base de données (18 modèles)
├── db/
│   └── custom.db              # Base de données SQLite
├── public/                    # Assets statiques
├── src/
│   ├── app/
│   │   ├── api/               # Routes API REST
│   │   │   ├── auth/          # Authentification (login, register, me)
│   │   │   ├── churches/      # Gestion des paroisses
│   │   │   ├── activities/    # Activités
│   │   │   ├── appointments/  # Rendez-vous
│   │   │   ├── groups/        # Groupes
│   │   │   ├── donations/     # Dons
│   │   │   ├── certificates/  # Certificats
│   │   │   ├── abbes/         # Liste des abbés
│   │   │   ├── notifications/ # Notifications
│   │   │   ├── stats/         # Statistiques dashboard
│   │   │   └── seed/          # Données de démo
│   │   ├── globals.css        # Thème ecclésiastique
│   │   ├── layout.tsx         # Layout racine
│   │   └── page.tsx           # Point d'entrée SPA
│   ├── components/
│   │   ├── church/            # Composants landing & auth
│   │   │   ├── landing-page.tsx
│   │   │   ├── auth-modal.tsx
│   │   │   └── setup-wizard.tsx
│   │   ├── dashboard/         # Composants du dashboard
│   │   │   ├── dashboard-layout.tsx
│   │   │   └── pages/
│   │   │       ├── dashboard-page.tsx
│   │   │       ├── members-page.tsx
│   │   │       ├── activities-page.tsx
│   │   │       ├── appointments-page.tsx
│   │   │       ├── groups-page.tsx
│   │   │       ├── finances-page.tsx
│   │   │       ├── certificates-page.tsx
│   │   │       ├── cemetery-page.tsx
│   │   │       ├── communication-page.tsx
│   │   │       ├── settings-page.tsx
│   │   │       └── billing-page.tsx
│   │   └── ui/                # Composants shadcn/ui (50+)
│   ├── hooks/                 # Hooks React personnalisés
│   └── lib/
│       ├── api.ts             # Client API
│       ├── db.ts              # Client Prisma
│       ├── seed.ts            # Données de démonstration
│       ├── store.ts           # Store Zustand
│       └── utils.ts           # Utilitaires
└── package.json
```

---

## 🛠️ Stack Technique

| Catégorie | Technologie |
|-----------|------------|
| Framework | Next.js 16 (App Router) |
| Langage | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Base de données | SQLite (Prisma ORM) |
| State Management | Zustand |
| Graphiques | Recharts |
| Animations | Framer Motion |
| Icônes | Lucide React |
| Formulaires | React Hook Form + Zod |
| Tables | TanStack Table |

---

## 🎨 Design System

- **Couleur primaire** : `#1B3A5C` (bleu ecclésiastique)
- **Couleur secondaire** : `#C9A84C` (or liturgique)
- **Police titres** : Playfair Display (serif)
- **Police corps** : Inter (sans-serif)
- **Mode sombre** : Supporté

---

## 📜 Commandes disponibles

```bash
bun run dev          # Démarrer le serveur de développement
bun run build        # Build de production
bun run lint         # Vérifier la qualité du code
bun run db:push      # Pousser le schéma Prisma vers la DB
bun run db:generate  # Générer le client Prisma
bun run db:migrate   # Créer une migration
bun run db:reset     # Réinitialiser la base de données
```

---

## 🌍 Marché cible

- 🇸🇳 Sénégal
- 🇨🇮 Côte d'Ivoire
- 🇨🇲 Cameroun
- 🇧🇫 Burkina Faso
- 🇲🇱 Mali
- 🇬🇦 Gabon
- 🇨🇬 Congo
- 🇹🇩 Tchad
- 🇧🇯 Bénin
- 🇹🇬 Togo
- 🌍 Et toute la diaspora africaine

---

## ⚠️ Sécurité

**Important** : Si vous avez partagé votre token GitHub, veuillez le révoquer immédiatement et en créer un nouveau dans **Settings > Developer settings > Personal access tokens**.

---

## 📄 Licence

MIT License - Libre d'utilisation pour tous les projets paroissiaux.

---

<p align="center">
  Made with ❤️ in Africa for the Church
</p>
