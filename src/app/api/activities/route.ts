import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const churchId = searchParams.get('churchId')
    if (!churchId) {
      return NextResponse.json({ message: 'churchId requis' }, { status: 400 })
    }

    const type = searchParams.get('type')
    const visibility = searchParams.get('visibility')

    const where: Record<string, unknown> = { churchId }
    if (type) where.type = type
    if (visibility) where.visibility = visibility

    const activities = await db.activity.findMany({
      where,
      orderBy: { startDateTime: 'asc' },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        celebrand: { select: { id: true, firstName: true, lastName: true } },
        group: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ activities })
  } catch (error) {
    console.error('Activities error:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const activity = await db.activity.create({
      data: {
        churchId: body.churchId,
        createdById: body.createdById,
        title: body.title,
        description: body.description || null,
        type: body.type,
        startDateTime: body.startDateTime,
        endDateTime: body.endDateTime,
        location: body.location || null,
        visibility: body.visibility || 'PUBLIC',
        celebrandId: body.celebrandId || null,
        maxParticipants: body.maxParticipants || null,
        currentParticipants: 0,
      },
    })

    return NextResponse.json({ activity }, { status: 201 })
  } catch (error) {
    console.error('Create activity error:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
