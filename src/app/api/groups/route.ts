import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const churchId = searchParams.get('churchId')
    if (!churchId) return NextResponse.json({ message: 'churchId requis' }, { status: 400 })

    const groups = await db.group.findMany({
      where: { churchId, isActive: true },
      include: {
        admin: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        _count: { select: { groupMembers: { where: { status: 'ACCEPTED' } } } },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ groups })
  } catch (error) {
    console.error('Groups error:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const group = await db.group.create({
      data: {
        churchId: body.churchId,
        adminId: body.adminId,
        name: body.name,
        description: body.description || null,
        type: body.type,
        maxMembers: body.maxMembers || null,
        isActive: true,
      },
    })

    return NextResponse.json({ group }, { status: 201 })
  } catch (error) {
    console.error('Create group error:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
