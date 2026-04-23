import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

// Helper: generate a slug from a church name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD') // decompose accented chars
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s-]/g, '') // remove special chars
    .replace(/\s+/g, '-') // spaces to hyphens
    .replace(/-+/g, '-') // collapse multiple hyphens
    .replace(/^-|-$/g, '') // trim leading/trailing hyphens
}

// Helper: ensure slug is unique by appending a number if needed
async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug
  let counter = 2

  while (await db.church.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

// Parish registration schema (ADMIN_PAROISSE)
const parishRegistrationSchema = z.object({
  role: z.literal('ADMIN_PAROISSE'),
  firstName: z.string().min(2, 'Le prénom est requis'),
  lastName: z.string().min(2, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  phone: z.string().min(1, 'Le téléphone est requis'),
  // Church fields
  churchName: z.string().min(2, 'Le nom de la paroisse est requis'),
  churchSlug: z.string().optional(),
  churchCity: z.string().min(1, 'La ville est requise'),
  churchCountry: z.string().min(1, 'Le pays est requis'),
  churchDiocese: z.string().optional(),
  churchPhone: z.string().optional(),
  churchEmail: z.string().email('Email de la paroisse invalide'),
  churchAddress: z.string().optional(),
  numberOfFaithful: z.number().int().min(0).optional(),
})

// Faithful registration schema (PAROISSIEN)
const faithfulRegistrationSchema = z.object({
  role: z.literal('PAROISSIEN'),
  firstName: z.string().min(2, 'Le prénom est requis'),
  lastName: z.string().min(2, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  phone: z.string().optional(),
  churchId: z.string().min(1, 'La paroisse est requise'),
})

const registerSchema = z.discriminatedUnion('role', [
  parishRegistrationSchema,
  faithfulRegistrationSchema,
])

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = registerSchema.parse(body)

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Un compte avec cet email existe déjà' },
        { status: 409 }
      )
    }

    if (data.role === 'ADMIN_PAROISSE') {
      // ═══════════════════════════════════════════════════
      // PARISH REGISTRATION FLOW
      // Creates Church + User + Subscription atomically
      // ═══════════════════════════════════════════════════

      // Generate slug
      const baseSlug = data.churchSlug || generateSlug(data.churchName)
      const slug = await ensureUniqueSlug(baseSlug)

      // Check church email uniqueness
      const existingChurchEmail = await db.church.findUnique({
        where: { email: data.churchEmail },
      })

      if (existingChurchEmail) {
        return NextResponse.json(
          { message: 'Une paroisse avec cet email existe déjà' },
          { status: 409 }
        )
      }

      const now = new Date()
      const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) // 14-day trial
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())

      // Use transaction to create Church + User + Subscription atomically
      const result = await db.$transaction(async (tx) => {
        // 1. Create the Church
        const church = await tx.church.create({
          data: {
            name: data.churchName,
            slug,
            email: data.churchEmail,
            phone: data.churchPhone || '',
            address: data.churchAddress || '',
            city: data.churchCity,
            country: data.churchCountry,
            diocese: data.churchDiocese || null,
            numberOfFaithful: data.numberOfFaithful || 0,
            plan: 'FREE',
            isActive: true,
            isVerified: false,
            setupComplete: false,
          },
        })

        // 2. Create the User (admin of the new church)
        // In production, hash password with bcrypt. For demo, store plain.
        const user = await tx.user.create({
          data: {
            email: data.email,
            password: data.password, // In production: await bcrypt.hash(data.password, 10)
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            address: data.churchAddress || '',
            role: 'ADMIN_PAROISSE',
            churchId: church.id,
            isActive: true,
            emailVerified: false,
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
            role: true,
            churchId: true,
            isActive: true,
            emailVerified: true,
            createdAt: true,
          },
        })

        // 3. Create Subscription with TRIALING status and 14-day trial
        await tx.subscription.create({
          data: {
            churchId: church.id,
            plan: 'FREE',
            status: 'TRIALING',
            billingCycle: 'MONTHLY',
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            trialEndsAt: trialEnd,
          },
        })

        return { user, church }
      })

      // Fetch full church info for response
      const church = await db.church.findUnique({
        where: { id: result.church.id },
        select: {
          id: true,
          name: true,
          slug: true,
          address: true,
          phone: true,
          email: true,
          city: true,
          country: true,
          logoUrl: true,
          photoUrl: true,
          motto: true,
          description: true,
          primaryColor: true,
          secondaryColor: true,
          plan: true,
          numberOfFaithful: true,
          isActive: true,
          isVerified: true,
          setupComplete: true,
        },
      })

      return NextResponse.json(
        { user: result.user, church },
        { status: 201 }
      )
    } else {
      // ═══════════════════════════════════════════════════
      // FAITHFUL REGISTRATION FLOW
      // Creates a User linked to an existing church
      // ═══════════════════════════════════════════════════

      // Verify the church exists and is active
      const church = await db.church.findUnique({
        where: { id: data.churchId },
      })

      if (!church) {
        return NextResponse.json(
          { message: 'Paroisse introuvable' },
          { status: 404 }
        )
      }

      if (!church.isActive) {
        return NextResponse.json(
          { message: 'Cette paroisse n\'est pas active' },
          { status: 403 }
        )
      }

      // In production, hash password with bcrypt. For demo, store plain.
      const user = await db.user.create({
        data: {
          email: data.email,
          password: data.password, // In production: await bcrypt.hash(data.password, 10)
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || '',
          address: '',
          role: 'PAROISSIEN',
          churchId: data.churchId,
          isActive: true,
          emailVerified: false,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatarUrl: true,
          role: true,
          churchId: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
        },
      })

      // Fetch church info for response
      const churchInfo = await db.church.findUnique({
        where: { id: data.churchId },
        select: {
          id: true,
          name: true,
          slug: true,
          address: true,
          phone: true,
          email: true,
          city: true,
          country: true,
          logoUrl: true,
          photoUrl: true,
          motto: true,
          description: true,
          primaryColor: true,
          secondaryColor: true,
          plan: true,
          numberOfFaithful: true,
          isActive: true,
          isVerified: true,
          setupComplete: true,
        },
      })

      return NextResponse.json(
        { user, church: churchInfo },
        { status: 201 }
      )
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Données invalides', errors: error.errors },
        { status: 400 }
      )
    }
    console.error('Register error:', error)
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
