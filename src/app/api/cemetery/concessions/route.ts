import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const churchId = searchParams.get('churchId')

    if (!churchId) {
      return NextResponse.json({ message: 'churchId requis' }, { status: 400 })
    }

    const concessions = await db.cemeteryConcession.findMany({
      where: { churchId },
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        defunts: true,
      },
    })

    return NextResponse.json({ concessions })
  } catch (error) {
    console.error('Cemetery concessions error:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.churchId) {
      return NextResponse.json({ message: 'churchId requis' }, { status: 400 })
    }

    if (!body.ownerId) {
      return NextResponse.json({ message: 'ownerId requis' }, { status: 400 })
    }

    const concession = await db.cemeteryConcession.create({
      data: {
        churchId: body.churchId,
        ownerId: body.ownerId,
        location: body.location || null,
        plotNumber: body.plotNumber || null,
        startDate: body.startDate || '',
        endDate: body.endDate || '',
        duration: body.duration || null,
        notes: body.notes || null,
        status: 'ACTIVE',
      },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        defunts: true,
      },
    })

    return NextResponse.json({ concession }, { status: 201 })
  } catch (error) {
    console.error('Create concession error:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
