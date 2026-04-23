import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const churchId = searchParams.get('churchId')

    if (!churchId) {
      return NextResponse.json({ message: 'churchId requis' }, { status: 400 })
    }

    // Get counts
    const [
      totalMembers,
      activeMembers,
      todayAppointments,
      weekActivities,
      monthDonations,
      pendingCertificates,
      pendingAppointments,
      groups,
    ] = await Promise.all([
      db.user.count({ where: { churchId, role: 'PAROISSIEN' } }),
      db.user.count({ where: { churchId, role: 'PAROISSIEN', isActive: true } }),
      db.appointment.count({
        where: {
          churchId,
          date: new Date().toISOString().split('T')[0],
        },
      }),
      db.activity.count({
        where: {
          churchId,
          startDateTime: { gte: new Date().toISOString() },
        },
      }),
      db.donation.findMany({
        where: {
          churchId,
          status: 'SUCCESS',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
          },
        },
        select: { amount: true, currency: true, method: true, createdAt: true },
      }),
      db.certificate.count({ where: { churchId, status: 'DEMANDED' } }),
      db.appointment.count({ where: { churchId, status: 'EN_ATTENTE' } }),
      db.group.count({ where: { churchId, isActive: true } }),
    ])

    const totalDonations = monthDonations.reduce((sum, d) => sum + d.amount, 0)

    // Donations by method
    const donationsByMethod = monthDonations.reduce((acc, d) => {
      acc[d.method] = (acc[d.method] || 0) + d.amount
      return acc
    }, {} as Record<string, number>)

    // Monthly donations for chart (last 6 months)
    const monthlyDonations = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const monthDons = await db.donation.findMany({
        where: {
          churchId,
          status: 'SUCCESS',
          createdAt: {
            gte: monthStart.toISOString(),
            lte: monthEnd.toISOString(),
          },
        },
        select: { amount: true },
      })

      monthlyDonations.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short' }),
        amount: monthDons.reduce((sum, d) => sum + d.amount, 0),
      })
    }

    // Recent members
    const recentMembers = await db.user.findMany({
      where: { churchId, role: 'PAROISSIEN' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        isActive: true,
      },
    })

    // Upcoming activities
    const upcomingActivities = await db.activity.findMany({
      where: {
        churchId,
        startDateTime: { gte: new Date().toISOString() },
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
      },
    })

    return NextResponse.json({
      totalMembers,
      activeMembers,
      todayAppointments,
      weekActivities,
      totalDonations,
      donationsByMethod,
      monthlyDonations,
      pendingCertificates,
      pendingAppointments,
      groups,
      recentMembers,
      upcomingActivities,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
