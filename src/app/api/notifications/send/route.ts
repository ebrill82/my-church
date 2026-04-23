import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { churchId, target, title, body: notifBody, type, link } = body

    if (!churchId || !title || !notifBody) {
      return NextResponse.json(
        { message: 'Données manquantes (churchId, title, body requis)' },
        { status: 400 }
      )
    }

    let userIds: string[] = []

    if (!target || target.type === 'all') {
      const users = await db.user.findMany({
        where: { churchId, isActive: true },
        select: { id: true },
      })
      userIds = users.map(u => u.id)
    } else if (target.type === 'group' && target.groupId) {
      const members = await db.groupMember.findMany({
        where: { groupId: target.groupId, status: 'ACCEPTED' },
        select: { userId: true },
      })
      userIds = members.map(m => m.userId)
    } else if (target.type === 'user' && target.userId) {
      userIds = [target.userId]
    }

    if (userIds.length === 0) {
      return NextResponse.json(
        { message: 'Aucun utilisateur ciblé' },
        { status: 400 }
      )
    }

    const notifications = await Promise.all(
      userIds.map(userId =>
        db.notification.create({
          data: {
            userId,
            type: type || 'SYSTEM',
            title,
            body: notifBody,
            link: link || null,
            data: JSON.stringify({ churchId }),
          },
        })
      )
    )

    return NextResponse.json({ sent: notifications.length, notifications }, { status: 201 })
  } catch (error) {
    console.error('Send notification error:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
