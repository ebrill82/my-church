# Task 2-b: Auth and Registration Components for Multi-Parish SaaS

## Agent: Frontend Auth Components Developer
## Date: 2025-01-20

### Task Summary
Build new auth and registration components for the multi-tenant SaaS platform refactoring.

### Work Completed

#### 1. API Routes Created
- **`/api/churches/search/route.ts`** — GET endpoint for searching churches by name, city, country, slug, diocese. Returns `{ churches, grouped }` where grouped organizes churches by country.
- **`/api/churches/check-slug/route.ts`** — GET endpoint to check slug availability. Returns `{ available, slug, suggestion?, message }`. Validates slug format with regex.
- **`/api/auth/register/route.ts`** — Updated to support `registrationType` field:
  - `'church'`: Creates a Church record first, then creates User with ADMIN_PAROISSE role linked to the new church. Supports church-specific fields (churchName, churchSlug, diocese, country, city, numberOfFaithful, address, role).
  - `'faithful'`: Creates User with PAROISSIEN role, linked to an existing church via churchId.

#### 2. Components Created (5 files)

- **`register-page.tsx`** — Main registration choice page:
  - Full-page with deep blue gradient background + subtle cross pattern
  - Two large side-by-side cards: "JE SUIS UNE PAROISSE" ⛪ and "JE SUIS UN FIDÈLE" 👤
  - Framer Motion entrance animations (slide from left/right)
  - Bottom link: "Déjà un compte ? Se connecter"
  - Navigates to register-church or church-search pages

- **`register-church-page.tsx`** — Parish registration 2-step form:
  - Step 1: Admin Account (firstName, lastName, email, phone, role dropdown, password with strength indicator, confirm password)
  - Step 2: Parish Info (churchName, slug URL with auto-generation + availability check, diocese, country with 17 African countries, city, numberOfFaithful, address, logo upload drag & drop, terms/privacy checkboxes)
  - Left decorative panel (desktop) with Church icon, stats (500+ Paroisses, 25+ Pays, 14j essai)
  - Step indicator at top with check marks for completed steps
  - Password strength indicator: red (weak) → orange (fair) → yellow-green (good) → green (strong)
  - Slug auto-generation: normalize, lowercase, hyphens, remove accents/special chars
  - Debounced slug availability check via `/api/churches/check-slug`
  - On success: calls store's login(), navigates to setup-wizard

- **`church-search-page.tsx`** — Parish search for faithful:
  - Full-page with deep blue gradient background
  - Search bar with magnifying glass icon, debounced search via `/api/churches/search`
  - Invitation link section with text input
  - Country groups (expandable) showing parish count per country
  - Church cards showing: name, city, number of faithful, member count, "Rejoindre" button
  - Clicking "Rejoindre" stores church in Zustand's selectedChurch and navigates to register-faithful

- **`register-faithful-page.tsx`** — Faithful registration form:
  - Church banner at top (gradient blue card) showing selected church info (name, city, country, faithful count)
  - Registration form: firstName, lastName, email, phone (optional), password + confirm, newsletter checkbox
  - If no church selected, shows message with link to church-search
  - On success: calls store's login(), navigates to dashboard

- **`login-page.tsx`** — Full-page login with split layout:
  - Left side: Login form (email, password with show/hide, "Se souvenir de moi", "Mot de passe oublié ?")
  - Right side (desktop): Decorative gradient panel with Church icon, heading, testimonial, stats (500+ Paroisses, 25+ Pays, 100K+ Fidèles)
  - Links to register-church and church-search for different user types
  - Demo credentials hint box with two parishes (admin@saintjean.sn, admin@saintpierre.cm)

#### 3. Updated Files

- **`/src/app/page.tsx`** — Updated to handle new auth page routes:
  - Added imports for all 5 new components
  - Added switch/case for unauthenticated pages: 'register', 'register-church', 'church-search', 'register-faithful', 'login'
  - Default falls through to LandingPage + AuthModal

#### 4. Cleanup
- Removed broken `emberId]` directory from `/api/churches/[slug]/members/` (was a typo from a previous agent)
- Regenerated Prisma client to fix stale client issue

### Design Decisions
- All components use the ecclesiastical theme colors (#1B3A5C blue, #C9A84C gold)
- Responsive design (mobile-first)
- All text in French
- Framer Motion animations for entrance transitions and step changes
- Password strength indicator with color-coded progress bar
- Slug auto-generation with real-time availability checking (debounced 500ms)
- Store's `selectedChurch` used to pass church context between search and registration

### Files Created
- `/src/components/church/register-page.tsx`
- `/src/components/church/register-church-page.tsx`
- `/src/components/church/church-search-page.tsx`
- `/src/components/church/register-faithful-page.tsx`
- `/src/components/church/login-page.tsx`
- `/src/app/api/churches/search/route.ts`
- `/src/app/api/churches/check-slug/route.ts`

### Files Modified
- `/src/app/api/auth/register/route.ts` (added registrationType support, church creation logic)
- `/src/app/page.tsx` (added routing for new auth pages)
