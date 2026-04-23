import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const group = await db.group.findUnique({
      where: { id },
      include: {
        admin: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        groupMembers: {
          where: { status: 'ACCEPTED' },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        activities: {
          where: { startDateTime: { gte: new Date().toISOString() } },
          orderBy: { startDateTime: 'asc' },
          take: 5,
        },
      },
    })

    if (!group) {
      return NextResponse.json({ message: 'Groupe non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ group })
  } catch (error) {
    console.error('Group detail error:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
