import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

// GET: Search churches by name, city, or country
// Query params: q (search term), country, page, limit
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const country = searchParams.get('country') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const skip = (page - 1) * limit

    const where: Prisma.ChurchWhereInput = { isActive: true }

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { city: { contains: q } },
        { country: { contains: q } },
        { slug: { contains: q } },
        { diocese: { contains: q } },
      ]
    }

    if (country) {
      if (q && where.OR) {
        // Both search term and country: intersect
        where.AND = [
          { OR: [
            { name: { contains: q } },
            { city: { contains: q } },
            { slug: { contains: q } },
            { diocese: { contains: q } },
          ]},
          { country: { contains: country } },
        ]
        delete where.OR
      } else {
        where.country = { contains: country }
      }
    }

    const [churches, total] = await Promise.all([
      db.church.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          city: true,
          country: true,
          plan: true,
          numberOfFaithful: true,
          description: true,
          logoUrl: true,
          isVerified: true,
          _count: {
            select: {
              users: { where: { isActive: true } },
              activities: true,
              groups: { where: { isActive: true } },
            },
          },
        },
        orderBy: [
          { isVerified: 'desc' },
          { name: 'asc' },
        ],
        skip,
        take: limit,
      }),
      db.church.count({ where }),
    ])

    // Transform to include stats as flat fields
    const results = churches.map(({ _count, ...church }) => ({
      ...church,
      stats: {
        members: _count.users,
        activities: _count.activities,
        groups: _count.groups,
      },
    }))

    return NextResponse.json({
      results,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    })
  } catch (error) {
    console.error('Church search error:', error)
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
