import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const churchId = searchParams.get('churchId')
    const userId = searchParams.get('userId')

    const where: Record<string, unknown> = {}
    if (userId) where.userId = userId
    if (churchId) {
      where.user = { churchId }
    }

    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Notifications error:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
