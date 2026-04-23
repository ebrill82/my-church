import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ churchId: string }> }
) {
  try {
    const { churchId } = await params
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { churchId }
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ]
    }
    if (status === 'active') where.isActive = true
    if (status === 'inactive') where.isActive = false

    const [members, total] = await Promise.all([
      db.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          avatarUrl: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          groupMembers: {
            include: {
              group: { select: { id: true, name: true, type: true } },
            },
            where: { status: 'ACCEPTED' },
          },
        },
      }),
      db.user.count({ where }),
    ])

    return NextResponse.json({
      members,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Members fetch error:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ churchId: string }> }
) {
  try {
    const { churchId } = await params
    const body = await request.json()

    const user = await db.user.create({
      data: {
        email: body.email,
        password: body.password || 'changeme123',
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone || '',
        address: body.address || '',
        role: body.role || 'PAROISSIEN',
        churchId,
        isActive: true,
        emailVerified: false,
      },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Create member error:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
