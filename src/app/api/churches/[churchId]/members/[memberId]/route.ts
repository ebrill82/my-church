import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ churchId: string; memberId: string }> }
) {
  try {
    const { churchId, memberId } = await params
    const body = await request.json()

    // Verify the member belongs to this church
    const existingMember = await db.user.findFirst({
      where: { id: memberId, churchId },
    })

    if (!existingMember) {
      return NextResponse.json(
        { message: 'Membre non trouvé dans cette paroisse' },
        { status: 404 }
      )
    }

    // Build update data from provided fields
    const updateData: Record<string, unknown> = {}
    if (body.firstName !== undefined) updateData.firstName = body.firstName
    if (body.lastName !== undefined) updateData.lastName = body.lastName
    if (body.email !== undefined) updateData.email = body.email
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.address !== undefined) updateData.address = body.address
    if (body.role !== undefined) updateData.role = body.role
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    const updatedUser = await db.user.update({
      where: { id: memberId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        emailVerified: true,
        churchId: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Update member error:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
