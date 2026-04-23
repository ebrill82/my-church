# Task 2-a: Update API Routes for Multi-Parish Support

## Agent: API Developer
## Date: 2025-01-20

## Summary
Updated all API routes to support multi-tenant SaaS architecture with multi-parish support. Created new routes for church search, slug-based lookup, and slug availability check. Restructured the `[churchId]` directory to `[slug]` to resolve Next.js dynamic route naming conflict.

## Files Updated/Created

### 1. `/src/app/api/auth/register/route.ts` — REWRITTEN
- **Two registration flows** using `z.discriminatedUnion` on `role`:
  - **ADMIN_PAROISSE (Parish Registration)**: Creates Church + User + Subscription atomically via `$transaction`
    - Required fields: firstName, lastName, email, password, phone, churchName, churchCity, churchCountry, churchEmail
    - Optional: churchSlug, churchDiocese, churchPhone, churchAddress, numberOfFaithful
    - Auto-generates slug from churchName if not provided (accents removed, special chars stripped)
    - Ensures unique slug by appending incrementing number
    - Creates subscription with TRIALING status and 14-day trial period
  - **PAROISSIEN (Faithful Registration)**: Creates User linked to existing church
    - Required fields: firstName, lastName, email, password, churchId
    - Validates church exists and is active before creation

### 2. `/src/app/api/auth/login/route.ts` — UPDATED
- Removed hardcoded `DEMO_CREDENTIALS` object
- Password verification now always checks against database (plain text for demo, bcrypt comment for production)
- Returns church info with additional fields: city, country, isActive, isVerified, setupComplete
- Added check for inactive church (returns 403)
- Clean separation of user and church in response

### 3. `/src/app/api/churches/route.ts` — REWRITTEN
- **GET**: Enhanced with search and country filter query params
  - Returns churches with: id, name, slug, address, city, country, phone, email, logoUrl, plan, numberOfFaithful, description, motto, isActive, isVerified, setupComplete, memberCount
  - Filters by `isActive: true` by default
  - Supports `search` param (searches name, city, country, slug) and `country` filter
- **POST**: Create a new church with Zod validation
  - Generates unique slug from name
  - Creates subscription with TRIALING status and 14-day trial in a transaction

### 4. `/src/app/api/churches/search/route.ts` — NEW
- **GET**: Search churches by name, city, country, slug, or diocese
- Query params: `q` (search term), `country`, `page`, `limit`
- Supports combined search + country filter using AND condition
- Returns paginated results with stats: members, activities, groups counts
- Results ordered by isVerified (verified first), then name ascending

### 5. `/src/app/api/churches/[slug]/route.ts` — NEW
- **GET**: Get a church by its slug for public parish pages
- Returns full church details with:
  - Stats: active members, activities, active groups counts
  - Subscription info: plan, status, trial end date
  - Upcoming public activities (max 5)
  - Active groups with member counts (max 6)
- Returns 404 for inactive or non-existent churches

### 6. `/src/app/api/churches/check-slug/route.ts` — NEW
- **GET**: Check if a slug is available
- Query param: `slug`
- Validates slug format (lowercase, alphanumeric, hyphens)
- Returns: `{ available: boolean, slug, message, suggestion? }`
- If taken, suggests an alternative slug with a number suffix

### 7. `/src/app/api/stats/route.ts` — UPDATED
- Added church existence validation before computing stats
- All queries properly filter by churchId (was already correct, added validation)
- Returns 404 if church not found

### 8. Directory Restructure
- Renamed `/api/churches/[churchId]/` → `/api/churches/[slug]/`
- Updated members routes (`[slug]/members/route.ts`, `[slug]/members/[memberId]/route.ts`) to destructure `slug` from params, aliased to `churchId` for backward compatibility with existing logic
- This was required to resolve Next.js conflict: "You cannot use different slug names for the same dynamic path"

### 9. Fix: Pre-existing lint error
- Added missing `Badge` import to `/src/components/church/register-faithful-page.tsx`

## Key Design Decisions
1. **z.discriminatedUnion** for register: Type-safe branching on `role` field ensures only valid combinations
2. **$transaction** for parish registration: Ensures Church + User + Subscription are created atomically
3. **Slug generation**: Uses NFD normalization + accent removal for proper French/African name handling
4. **Slug uniqueness**: Incrementing counter suffix approach (e.g., `paroisse-saint-pierre-2`)
5. **Consistent church response shape**: All endpoints return city, country, isActive, isVerified, setupComplete

## Lint: ✅ 0 errors, 0 warnings
## Dev Server: ✅ Compiles successfully
