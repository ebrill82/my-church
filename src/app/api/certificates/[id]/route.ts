import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const action = body.action // 'approve', 'reject', 'deliver'

    let status: string
    let updateData: Record<string, unknown> = {}
    switch (action) {
      case 'approve':
        status = 'APPROVED'
        updateData = { status, approvedById: body.approvedById }
        break
      case 'reject':
        status = 'REJECTED'
        updateData = { status, rejectionReason: body.reason || null }
        break
      case 'deliver':
        status = 'DELIVERED'
        updateData = { status, pdfUrl: body.pdfUrl || null }
        break
      default:
        return NextResponse.json({ message: 'Action invalide' }, { status: 400 })
    }

    const certificate = await db.certificate.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ certificate })
  } catch (error) {
    console.error('Update certificate error:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
