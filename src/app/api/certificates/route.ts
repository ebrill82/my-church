import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const churchId = searchParams.get('churchId')
    if (!churchId) return NextResponse.json({ message: 'churchId requis' }, { status: 400 })

    const status = searchParams.get('status')
    const type = searchParams.get('type')

    const where: Record<string, unknown> = { churchId }
    if (status) where.status = status
    if (type) where.type = type

    const certificates = await db.certificate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        approvedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json({ certificates })
  } catch (error) {
    console.error('Certificates error:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const certificate = await db.certificate.create({
      data: {
        churchId: body.churchId,
        userId: body.userId,
        type: body.type,
        details: JSON.stringify(body.details || {}),
        status: 'DEMANDED',
        fee: body.fee || 5000,
        feePaid: false,
      },
    })

    return NextResponse.json({ certificate }, { status: 201 })
  } catch (error) {
    console.error('Create certificate error:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
