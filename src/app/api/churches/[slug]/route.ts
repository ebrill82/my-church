import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Get a church by its slug (for public parish pages)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const church = await db.church.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        country: true,
        website: true,
        diocese: true,
        numberOfFaithful: true,
        logoUrl: true,
        photoUrl: true,
        motto: true,
        description: true,
        primaryColor: true,
        secondaryColor: true,
        plan: true,
        isActive: true,
        isVerified: true,
        setupComplete: true,
        createdAt: true,
        _count: {
          select: {
            users: { where: { isActive: true } },
            activities: true,
            groups: { where: { isActive: true } },
          },
        },
        subscription: {
          select: {
            plan: true,
            status: true,
            trialEndsAt: true,
          },
        },
      },
    })

    if (!church) {
      return NextResponse.json(
        { message: 'Paroisse introuvable' },
        { status: 404 }
      )
    }

    if (!church.isActive) {
      return NextResponse.json(
        { message: 'Cette paroisse n\'est pas active' },
        { status: 404 }
      )
    }

    // Get upcoming public activities (max 5)
    const upcomingActivities = await db.activity.findMany({
      where: {
        churchId: church.id,
        startDateTime: { gte: new Date().toISOString() },
        visibility: 'PUBLIC',
      },
      orderBy: { startDateTime: 'asc' },
      take: 5,
      select: {
        id: true,
        title: true,
        type: true,
        startDateTime: true,
        endDateTime: true,
        location: true,
        description: true,
      },
    })

    // Get active groups (max 6)
    const groups = await db.group.findMany({
      where: {
        churchId: church.id,
        isActive: true,
      },
      orderBy: { name: 'asc' },
      take: 6,
      select: {
        id: true,
        name: true,
        type: true,
        description: true,
        _count: {
          select: { groupMembers: { where: { status: 'ACCEPTED' } } },
        },
      },
    })

    // Transform to include stats as flat fields
    const { _count, subscription, ...churchFields } = church

    return NextResponse.json({
      ...churchFields,
      stats: {
        members: _count.users,
        activities: _count.activities,
        groups: _count.groups,
      },
      subscription,
      upcomingActivities,
      groups: groups.map(({ _count: groupCount, ...group }) => ({
        ...group,
        memberCount: groupCount.groupMembers,
      })),
    })
  } catch (error) {
    console.error('Get church by slug error:', error)
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
