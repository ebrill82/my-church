import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // In production, verify JWT token from headers/cookies
    // For demo, return a simple response
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { message: 'Non authentifié' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: userId },
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
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    const { password: _, ...userWithoutPassword } = user
    const { church, ...userFields } = userWithoutPassword as Omit<typeof userWithoutPassword, 'password'> & { church: typeof user.church }

    return NextResponse.json({
      user: userFields,
      church: church || null,
    })
  } catch (error) {
    console.error('Get me error:', error)
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
