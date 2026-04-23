import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  firstName: z.string().min(2, 'Le prénom est requis'),
  lastName: z.string().min(2, 'Le nom est requis'),
  phone: z.string().optional(),
  churchId: z.string().optional(),
})

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

    // In production, hash password with bcrypt. For demo, store plain (not for prod!)
    const user = await db.user.create({
      data: {
        email: data.email,
        password: data.password, // In production: await bcrypt.hash(data.password, 10)
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || '',
        address: '',
        churchId: data.churchId || null,
        role: 'PAROISSIEN',
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
      },
    })

    // If user joined a church, fetch church info
    let church = null
    if (user.churchId) {
      church = await db.church.findUnique({
        where: { id: user.churchId },
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
      })
    }

    return NextResponse.json({ user, church }, { status: 201 })
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
