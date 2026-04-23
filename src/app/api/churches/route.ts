import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const churches = await db.church.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        plan: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(churches)
  } catch (error) {
    console.error('Get churches error:', error)
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
