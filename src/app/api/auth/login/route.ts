import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

// Demo credentials for testing
const DEMO_CREDENTIALS = {
  'admin@saintjean.sn': { password: 'password123', role: 'ADMIN_PAROISSE' },
  'pere.mbaye@saintjean.sn': { password: 'password123', role: 'ABBE' },
  'pere.sow@saintjean.sn': { password: 'password123', role: 'ABBE' },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = loginSchema.parse(body)

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: data.email },
      include: {
        church: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
            phone: true,
            email: true,
            logoUrl: true,
            photoUrl: true,
            motto: true,
            description: true,
            primaryColor: true,
            secondaryColor: true,
            plan: true,
            numberOfFaithful: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // In production: verify with bcrypt. For demo, check plain or demo credentials
    const demoCred = DEMO_CREDENTIALS[data.email as keyof typeof DEMO_CREDENTIALS]
    const passwordValid = demoCred
      ? data.password === demoCred.password
      : data.password === user.password

    if (!passwordValid) {
      return NextResponse.json(
        { message: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { message: 'Votre compte a été désactivé' },
        { status: 403 }
      )
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    const { password: _, ...userWithoutPassword } = user
    const { church, ...userFields } = userWithoutPassword as Omit<typeof userWithoutPassword, 'password'> & { church: typeof user.church }

    return NextResponse.json({
      user: userFields,
      church: church || null,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Données invalides', errors: error.errors },
        { status: 400 }
      )
    }
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
