import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const action = body.action // 'confirm', 'reject', 'cancel'

    let status: string
    switch (action) {
      case 'confirm': status = 'CONFIRME'; break
      case 'reject': status = 'REFUSE'; break
      case 'cancel': status = 'ANNULE'; break
      default: return NextResponse.json({ message: 'Action invalide' }, { status: 400 })
    }

    const appointment = await db.appointment.update({
      where: { id },
      data: {
        status: status as 'CONFIRME' | 'REFUSE' | 'ANNULE',
        ...(action === 'cancel' ? { canceledBy: body.canceledBy, canceledReason: body.reason } : {}),
      },
    })

    return NextResponse.json({ appointment })
  } catch (error) {
    console.error('Update appointment error:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
