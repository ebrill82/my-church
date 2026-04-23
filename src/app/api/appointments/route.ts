import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const churchId = searchParams.get('churchId')
    if (!churchId) return NextResponse.json({ message: 'churchId requis' }, { status: 400 })

    const date = searchParams.get('date')
    const abbeId = searchParams.get('abbeId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = { churchId }
    if (date) where.date = date
    if (abbeId) where.abbeId = abbeId
    if (status) where.status = status

    const appointments = await db.appointment.findMany({
      where,
      orderBy: { startTime: 'asc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, phone: true, avatarUrl: true } },
        abbe: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    })

    return NextResponse.json({ appointments })
  } catch (error) {
    console.error('Appointments error:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const appointment = await db.appointment.create({
      data: {
        userId: body.userId,
        abbeId: body.abbeId,
        churchId: body.churchId,
        date: body.date,
        startTime: body.startTime,
        endTime: body.endTime,
        motif: body.motif,
        notesFidele: body.notes || null,
        status: 'EN_ATTENTE',
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        abbe: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json({ appointment }, { status: 201 })
  } catch (error) {
    console.error('Create appointment error:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
