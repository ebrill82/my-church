import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

// Helper: generate a slug from a church name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
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

// GET: Return all churches with search and country filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const country = searchParams.get('country') || ''

    const where: Record<string, unknown> = { isActive: true }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { city: { contains: search } },
        { country: { contains: search } },
        { slug: { contains: search } },
      ]
    }

    if (country) {
      where.country = country
    }

    const churches = await db.church.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        city: true,
        country: true,
        phone: true,
        email: true,
        logoUrl: true,
        plan: true,
        numberOfFaithful: true,
        description: true,
        motto: true,
        isActive: true,
        isVerified: true,
        setupComplete: true,
        _count: {
          select: { users: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    // Transform to include member count as a flat field
    const result = churches.map(({ _count, ...church }) => ({
      ...church,
      memberCount: _count.users,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Get churches error:', error)
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST: Create a new church (for parish registration flow)
const createChurchSchema = z.object({
  name: z.string().min(2, 'Le nom de la paroisse est requis'),
  slug: z.string().optional(),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().min(1, 'La ville est requise'),
  country: z.string().min(1, 'Le pays est requis'),
  diocese: z.string().optional(),
  numberOfFaithful: z.number().int().min(0).optional(),
  motto: z.string().optional(),
  description: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createChurchSchema.parse(body)

    // Check church email uniqueness
    const existingChurchEmail = await db.church.findUnique({
      where: { email: data.email },
    })

    if (existingChurchEmail) {
      return NextResponse.json(
        { message: 'Une paroisse avec cet email existe déjà' },
        { status: 409 }
      )
    }

    // Generate unique slug
    const baseSlug = data.slug || generateSlug(data.name)
    const slug = await ensureUniqueSlug(baseSlug)

    const now = new Date()

    const church = await db.$transaction(async (tx) => {
      const newChurch = await tx.church.create({
        data: {
          name: data.name,
          slug,
          email: data.email,
          phone: data.phone || '',
          address: data.address || '',
          city: data.city,
          country: data.country,
          diocese: data.diocese || null,
          numberOfFaithful: data.numberOfFaithful || 0,
          motto: data.motto || null,
          description: data.description || null,
          primaryColor: data.primaryColor || '#1B3A5C',
          secondaryColor: data.secondaryColor || '#C9A84C',
          plan: 'FREE',
          isActive: true,
          isVerified: false,
          setupComplete: false,
        },
      })

      // Create subscription with TRIALING status and 14-day trial
      await tx.subscription.create({
        data: {
          churchId: newChurch.id,
          plan: 'FREE',
          status: 'TRIALING',
          billingCycle: 'MONTHLY',
          currentPeriodStart: now,
          currentPeriodEnd: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()),
          trialEndsAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        },
      })

      return newChurch
    })

    return NextResponse.json(church, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Données invalides', errors: error.errors },
        { status: 400 }
      )
    }
    console.error('Create church error:', error)
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
