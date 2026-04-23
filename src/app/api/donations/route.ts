import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const churchId = searchParams.get('churchId')
    if (!churchId) return NextResponse.json({ message: 'churchId requis' }, { status: 400 })

    const method = searchParams.get('method')
    const status = searchParams.get('status')
    const period = searchParams.get('period') // 'month', '3months', '6months', 'all'

    const where: Record<string, unknown> = { churchId }
    if (method) where.method = method
    if (status) where.status = status

    if (period && period !== 'all') {
      const now = new Date()
      let monthsBack = 1
      if (period === '3months') monthsBack = 3
      if (period === '6months') monthsBack = 6
      const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1)
      where.createdAt = { gte: startDate.toISOString() }
    }

    const donations = await db.donation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    })

    // Stats
    const successDonations = donations.filter(d => d.status === 'SUCCESS')
    const totalAmount = successDonations.reduce((sum, d) => sum + d.amount, 0)
    const avgAmount = successDonations.length > 0 ? totalAmount / successDonations.length : 0
    const maxAmount = successDonations.length > 0 ? Math.max(...successDonations.map(d => d.amount)) : 0

    return NextResponse.json({
      donations,
      stats: {
        total: totalAmount,
        count: successDonations.length,
        average: avgAmount,
        max: maxAmount,
      },
    })
  } catch (error) {
    console.error('Donations error:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const donation = await db.donation.create({
      data: {
        userId: body.userId || null,
        churchId: body.churchId,
        amount: body.amount,
        currency: body.currency || 'XOF',
        method: body.method,
        status: 'INITIATED',
        isAnonymous: body.isAnonymous || false,
        phoneNumber: body.phoneNumber || null,
      },
    })

    return NextResponse.json({ donation }, { status: 201 })
  } catch (error) {
    console.error('Create donation error:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
