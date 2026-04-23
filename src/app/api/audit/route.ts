import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const churchId = searchParams.get('churchId')

    if (!churchId) {
      return NextResponse.json({ message: 'churchId requis' }, { status: 400 })
    }

    const auditLogs = await db.auditLog.findMany({
      where: { churchId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    })

    return NextResponse.json({ auditLogs })
  } catch (error) {
    console.error('Audit logs error:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
