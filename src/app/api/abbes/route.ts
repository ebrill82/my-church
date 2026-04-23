import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const churchId = searchParams.get('churchId')
    if (!churchId) return NextResponse.json({ message: 'churchId requis' }, { status: 400 })

    const abbes = await db.user.findMany({
      where: { churchId, role: 'ABBE', isActive: true },
      select: { id: true, firstName: true, lastName: true, avatarUrl: true, phone: true },
      orderBy: { lastName: 'asc' },
    })

    return NextResponse.json({ abbes })
  } catch (error) {
    console.error('Abbes error:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
