import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Check if group exists
    const group = await db.group.findUnique({ where: { id } })
    if (!group) {
      return NextResponse.json({ message: 'Groupe non trouvé' }, { status: 404 })
    }

    // Check if already a member
    const existing = await db.groupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId: body.userId } },
    })
    if (existing) {
      return NextResponse.json({ message: 'Ce membre est déjà dans le groupe' }, { status: 400 })
    }

    const groupMember = await db.groupMember.create({
      data: {
        groupId: id,
        userId: body.userId,
        role: body.role || 'MEMBER',
        status: 'INVITED',
        invitedById: body.invitedById,
        invitedAt: new Date(),
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, email: true } },
      },
    })

    return NextResponse.json({ groupMember }, { status: 201 })
  } catch (error) {
    console.error('Invite member error:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
