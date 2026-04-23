import { db } from '@/lib/db'

export async function seedDatabase() {
  console.log('🌱 Seeding database with 5 multi-parish data...')

  // Clean existing data
  await db.auditLog.deleteMany()
  await db.notification.deleteMany()
  await db.defunt.deleteMany()
  await db.cemeteryConcession.deleteMany()
  await db.certificate.deleteMany()
  await db.quete.deleteMany()
  await db.donation.deleteMany()
  await db.message.deleteMany()
  await db.groupMember.deleteMany()
  await db.activity.deleteMany()
  await db.appointment.deleteMany()
  await db.invoice.deleteMany()
  await db.paymentConfig.deleteMany()
  await db.subscription.deleteMany()
  await db.group.deleteMany()
  await db.user.deleteMany()
  await db.church.deleteMany()
  await db.planLimit.deleteMany()

  // ---- Plan Limits ----
  await Promise.all([
    db.planLimit.create({ data: { plan: 'FREE', featureKey: 'max_members', maxValue: 50, description: 'Maximum de paroissiens' } }),
    db.planLimit.create({ data: { plan: 'FREE', featureKey: 'max_groups', maxValue: 1, description: 'Maximum de groupes' } }),
    db.planLimit.create({ data: { plan: 'FREE', featureKey: 'max_admins', maxValue: 1, description: 'Maximum d\'admins' } }),
    db.planLimit.create({ data: { plan: 'STANDARD', featureKey: 'max_members', maxValue: 1000, description: 'Maximum de paroissiens' } }),
    db.planLimit.create({ data: { plan: 'STANDARD', featureKey: 'max_groups', maxValue: 10, description: 'Maximum de groupes' } }),
    db.planLimit.create({ data: { plan: 'STANDARD', featureKey: 'max_admins', maxValue: 5, description: 'Maximum d\'admins' } }),
    db.planLimit.create({ data: { plan: 'PREMIUM', featureKey: 'max_members', maxValue: 0, description: 'Illimité' } }),
    db.planLimit.create({ data: { plan: 'PREMIUM', featureKey: 'max_groups', maxValue: 0, description: 'Illimité' } }),
    db.planLimit.create({ data: { plan: 'PREMIUM', featureKey: 'max_admins', maxValue: 0, description: 'Illimité' } }),
    db.planLimit.create({ data: { plan: 'DIOCESE', featureKey: 'max_members', maxValue: 0, description: 'Illimité' } }),
    db.planLimit.create({ data: { plan: 'DIOCESE', featureKey: 'max_groups', maxValue: 0, description: 'Illimité' } }),
    db.planLimit.create({ data: { plan: 'DIOCESE', featureKey: 'max_churches', maxValue: 100, description: 'Maximum de paroisses' } }),
  ])

  // ═══════════════════════════════════════════════════════════════════
  // 5 PARISHES
  // ═══════════════════════════════════════════════════════════════════

  const church1 = await db.church.create({
    data: {
      name: 'Paroisse Saint Jean Apôtre',
      slug: 'paroisse-saint-jean-apotre',
      email: 'paroisse@saintjean.sn',
      phone: '+221 33 800 00 00',
      address: '45 Rue Blanchot, Dakar',
      city: 'Dakar',
      country: 'Sénégal',
      diocese: 'Archidiocèse de Dakar',
      numberOfFaithful: 847,
      motto: 'Une communauté vivante au service du Christ',
      description: 'Paroisse Saint Jean Apôtre - Au cœur de Dakar, une communauté vivante au service de Dieu et des hommes.',
      plan: 'STANDARD',
      primaryColor: '#1B3A5C',
      secondaryColor: '#C9A84C',
      isActive: true,
      isVerified: true,
      setupComplete: true,
    },
  })

  const church2 = await db.church.create({
    data: {
      name: 'Paroisse Saint Pierre',
      slug: 'paroisse-saint-pierre',
      email: 'paroisse@saintpierre.cm',
      phone: '+237 6 00 00 00 00',
      address: 'Quartier Bonapriso, Douala',
      city: 'Douala',
      country: 'Cameroun',
      diocese: 'Archidiocèse de Douala',
      numberOfFaithful: 520,
      motto: 'Bâtir l\'Église ensemble',
      description: 'Paroisse Saint Pierre de Douala, communauté dynamique au service de l\'Évangile.',
      plan: 'PREMIUM',
      primaryColor: '#2D6A4F',
      secondaryColor: '#D4A017',
      isActive: true,
      isVerified: true,
      setupComplete: true,
    },
  })

  const church3 = await db.church.create({
    data: {
      name: 'Paroisse Notre Dame de la Paix',
      slug: 'paroisse-notre-dame-paix',
      email: 'paroisse@notredame.ci',
      phone: '+225 05 00 00 00',
      address: 'Cocody Riviera, Abidjan',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      diocese: 'Diocèse d\'Abidjan',
      numberOfFaithful: 1200,
      motto: 'Que la paix du Christ règne dans nos cœurs',
      description: 'Paroisse Notre Dame de la Paix d\'Abidjan, un lieu de prière et de communion.',
      plan: 'STANDARD',
      primaryColor: '#1B3A5C',
      secondaryColor: '#C9A84C',
      isActive: true,
      isVerified: true,
      setupComplete: true,
    },
  })

  const church4 = await db.church.create({
    data: {
      name: 'Paroisse Sainte Famille',
      slug: 'paroisse-sainte-famille',
      email: 'paroisse@saintefamille.cd',
      phone: '+243 800 000 00',
      address: 'Commune de Limete, Kinshasa',
      city: 'Kinshasa',
      country: 'RDC',
      diocese: 'Archidiocèse de Kinshasa',
      numberOfFaithful: 2300,
      motto: 'Jésus, Marie, Joseph, priez pour nous',
      description: 'Paroisse Sainte Famille de Kinshasa, une grande communauté croyante et accueillante.',
      plan: 'PREMIUM',
      primaryColor: '#8B4513',
      secondaryColor: '#FFD700',
      isActive: true,
      isVerified: true,
      setupComplete: true,
    },
  })

  const church5 = await db.church.create({
    data: {
      name: 'Paroisse Sacré Cœur',
      slug: 'paroisse-sacre-coeur',
      email: 'paroisse@sacrecoeur.bf',
      phone: '+226 70 00 00 00',
      address: 'Avenue Kwame Nkrumah, Ouagadougou',
      city: 'Ouagadougou',
      country: 'Burkina Faso',
      diocese: 'Archidiocèse de Ouagadougou',
      numberOfFaithful: 340,
      motto: 'Cœur sacré de Jésus, j\'ai confiance en vous',
      description: 'Paroisse Sacré Cœur de Ouagadougou, une petite communauté fervente.',
      plan: 'FREE',
      primaryColor: '#1B3A5C',
      secondaryColor: '#C9A84C',
      isActive: true,
      isVerified: false,
      setupComplete: false,
    },
  })

  const churches = [church1, church2, church3, church4, church5]

  // ═══════════════════════════════════════════════════════════════════
  // USERS FOR EACH PARISH
  // ═══════════════════════════════════════════════════════════════════

  // Church 1 - Saint Jean (Sénégal) - Most complete data
  const admin1 = await db.user.create({
    data: {
      email: 'admin@saintjean.sn', password: 'password123',
      firstName: 'Marie', lastName: 'Diop', phone: '+221 77 123 45 67',
      address: '12 Rue Carnot, Dakar', dateOfBirth: '1985-03-15', gender: 'F',
      role: 'ADMIN_PAROISSE', isActive: true, emailVerified: true, churchId: church1.id,
    },
  })
  const abbe1_1 = await db.user.create({
    data: {
      email: 'pere.mbaye@saintjean.sn', password: 'password123',
      firstName: 'Jean', lastName: 'Mbaye', phone: '+221 77 234 56 78',
      address: '45 Rue Blanchot, Dakar', dateOfBirth: '1970-06-20', gender: 'M',
      role: 'ABBE', isActive: true, emailVerified: true, churchId: church1.id,
    },
  })
  const abbe1_2 = await db.user.create({
    data: {
      email: 'pere.sow@saintjean.sn', password: 'password123',
      firstName: 'Paul', lastName: 'Sow', phone: '+221 77 345 67 89',
      address: '45 Rue Blanchot, Dakar', dateOfBirth: '1975-09-10', gender: 'M',
      role: 'ABBE', isActive: true, emailVerified: true, churchId: church1.id,
    },
  })
  const fideles1 = await Promise.all([
    db.user.create({ data: { email: 'aissatou.fall@email.sn', password: 'password123', firstName: 'Aissatou', lastName: 'Fall', phone: '+221 76 111 22 33', address: '78 Rue Pompidou, Dakar', dateOfBirth: '1990-01-05', gender: 'F', role: 'PAROISSIEN', isActive: true, emailVerified: true, churchId: church1.id } }),
    db.user.create({ data: { email: 'mamadou.sy@email.sn', password: 'password123', firstName: 'Mamadou', lastName: 'Sy', phone: '+221 76 222 33 44', address: '15 Avenue L.S. Senghor, Dakar', dateOfBirth: '1988-04-12', gender: 'M', role: 'PAROISSIEN', isActive: true, emailVerified: true, churchId: church1.id } }),
    db.user.create({ data: { email: 'fatou.ndiaye@email.sn', password: 'password123', firstName: 'Fatou', lastName: 'Ndiaye', phone: '+221 76 333 44 55', address: '22 Rue Dr. Theze, Dakar', dateOfBirth: '1995-07-22', gender: 'F', role: 'PAROISSIEN', isActive: true, emailVerified: true, churchId: church1.id } }),
    db.user.create({ data: { email: 'ousmane.ba@email.sn', password: 'password123', firstName: 'Ousmane', lastName: 'Ba', phone: '+221 76 444 55 66', address: '5 Rue Sandiniéry, Dakar', dateOfBirth: '1982-11-30', gender: 'M', role: 'PAROISSIEN', isActive: true, emailVerified: false, churchId: church1.id } }),
    db.user.create({ data: { email: 'khady.sarr@email.sn', password: 'password123', firstName: 'Khady', lastName: 'Sarr', phone: '+221 76 666 77 88', address: '33 Rue de Thann, Dakar', dateOfBirth: '1998-02-14', gender: 'F', role: 'PAROISSIEN', isActive: true, emailVerified: true, churchId: church1.id } }),
    db.user.create({ data: { email: 'ibrahima.gueye@email.sn', password: 'password123', firstName: 'Ibrahima', lastName: 'Guèye', phone: '+221 76 777 88 99', address: '67 Avenue Bourguiba, Dakar', dateOfBirth: '1980-08-25', gender: 'M', role: 'DIRIGEANT_GROUPE', isActive: true, emailVerified: true, churchId: church1.id } }),
  ])

  // Church 2 - Saint Pierre (Cameroun)
  const admin2 = await db.user.create({
    data: {
      email: 'admin@saintpierre.cm', password: 'password123',
      firstName: 'François', lastName: 'Mbeki', phone: '+237 6 11 22 33 44',
      address: 'Quartier Bonapriso, Douala', dateOfBirth: '1972-05-18', gender: 'M',
      role: 'ADMIN_PAROISSE', isActive: true, emailVerified: true, churchId: church2.id,
    },
  })
  const abbe2_1 = await db.user.create({
    data: {
      email: 'pere.ngassa@saintpierre.cm', password: 'password123',
      firstName: 'André', lastName: 'Ngassa', phone: '+237 6 22 33 44 55',
      address: 'Quartier Bonapriso, Douala', dateOfBirth: '1968-12-03', gender: 'M',
      role: 'ABBE', isActive: true, emailVerified: true, churchId: church2.id,
    },
  })
  const fideles2 = await Promise.all([
    db.user.create({ data: { email: 'marie.tchinda@email.cm', password: 'password123', firstName: 'Marie', lastName: 'Tchinda', phone: '+237 6 33 44 55 66', address: 'Akwa, Douala', dateOfBirth: '1992-08-21', gender: 'F', role: 'PAROISSIEN', isActive: true, emailVerified: true, churchId: church2.id } }),
    db.user.create({ data: { email: 'jean.ewonde@email.cm', password: 'password123', firstName: 'Jean', lastName: 'Ewonde', phone: '+237 6 44 55 66 77', address: 'Deido, Douala', dateOfBirth: '1985-03-10', gender: 'M', role: 'PAROISSIEN', isActive: true, emailVerified: true, churchId: church2.id } }),
    db.user.create({ data: { email: 'claire.fotso@email.cm', password: 'password123', firstName: 'Claire', lastName: 'Fotso', phone: '+237 6 55 66 77 88', address: 'Bonapriso, Douala', dateOfBirth: '1996-11-28', gender: 'F', role: 'DIRIGEANT_GROUPE', isActive: true, emailVerified: true, churchId: church2.id } }),
  ])

  // Church 3 - Notre Dame (Côte d'Ivoire)
  const admin3 = await db.user.create({
    data: {
      email: 'admin@notredame.ci', password: 'password123',
      firstName: 'Augustin', lastName: 'Diallo', phone: '+225 05 11 22 33 44',
      address: 'Cocody Riviera, Abidjan', dateOfBirth: '1968-02-14', gender: 'M',
      role: 'ADMIN_PAROISSE', isActive: true, emailVerified: true, churchId: church3.id,
    },
  })
  const abbe3_1 = await db.user.create({
    data: {
      email: 'pere.konan@notredame.ci', password: 'password123',
      firstName: 'Michel', lastName: 'Konan', phone: '+225 05 22 33 44 55',
      address: 'Cocody Riviera, Abidjan', dateOfBirth: '1975-09-20', gender: 'M',
      role: 'ABBE', isActive: true, emailVerified: true, churchId: church3.id,
    },
  })
  const fideles3 = await Promise.all([
    db.user.create({ data: { email: 'afoue.kouame@email.ci', password: 'password123', firstName: 'Afué', lastName: 'Kouamé', phone: '+225 05 33 44 55 66', address: 'Plateau, Abidjan', dateOfBirth: '1991-06-15', gender: 'F', role: 'PAROISSIEN', isActive: true, emailVerified: true, churchId: church3.id } }),
    db.user.create({ data: { email: 'yao.brou@email.ci', password: 'password123', firstName: 'Yao', lastName: 'Brou', phone: '+225 05 44 55 66 77', address: 'Marcory, Abidjan', dateOfBirth: '1987-01-30', gender: 'M', role: 'PAROISSIEN', isActive: true, emailVerified: true, churchId: church3.id } }),
  ])

  // Church 4 - Sainte Famille (RDC)
  const admin4 = await db.user.create({
    data: {
      email: 'admin@saintefamille.cd', password: 'password123',
      firstName: 'Emmanuel', lastName: 'Mbala', phone: '+243 811 222 333',
      address: 'Commune de Limete, Kinshasa', dateOfBirth: '1965-07-08', gender: 'M',
      role: 'ADMIN_PAROISSE', isActive: true, emailVerified: true, churchId: church4.id,
    },
  })
  const abbe4_1 = await db.user.create({
    data: {
      email: 'pere.mukendi@saintefamille.cd', password: 'password123',
      firstName: 'Joseph', lastName: 'Mukendi', phone: '+243 822 333 444',
      address: 'Commune de Limete, Kinshasa', dateOfBirth: '1970-04-22', gender: 'M',
      role: 'ABBE', isActive: true, emailVerified: true, churchId: church4.id,
    },
  })
  const fideles4 = await Promise.all([
    db.user.create({ data: { email: 'marie.ngoy@email.cd', password: 'password123', firstName: 'Marie', lastName: 'Ngoy', phone: '+243 833 444 555', address: 'Gombe, Kinshasa', dateOfBirth: '1993-12-01', gender: 'F', role: 'PAROISSIEN', isActive: true, emailVerified: true, churchId: church4.id } }),
    db.user.create({ data: { email: 'patrick.kalu@email.cd', password: 'password123', firstName: 'Patrick', lastName: 'Kalu', phone: '+243 844 555 666', address: 'Matonge, Kinshasa', dateOfBirth: '1989-05-19', gender: 'M', role: 'DIRIGEANT_GROUPE', isActive: true, emailVerified: true, churchId: church4.id } }),
  ])

  // Church 5 - Sacré Cœur (Burkina Faso)
  const admin5 = await db.user.create({
    data: {
      email: 'admin@sacrecoeur.bf', password: 'password123',
      firstName: 'Pierre', lastName: 'Ouédraogo', phone: '+226 70 11 22 33',
      address: 'Avenue Kwame Nkrumah, Ouagadougou', dateOfBirth: '1980-10-12', gender: 'M',
      role: 'ADMIN_PAROISSE', isActive: true, emailVerified: true, churchId: church5.id,
    },
  })
  const abbe5_1 = await db.user.create({
    data: {
      email: 'pere.sawadogo@sacrecoeur.bf', password: 'password123',
      firstName: 'Luc', lastName: 'Sawadogo', phone: '+226 70 22 33 44',
      address: 'Avenue Kwame Nkrumah, Ouagadougou', dateOfBirth: '1973-03-25', gender: 'M',
      role: 'ABBE', isActive: true, emailVerified: true, churchId: church5.id,
    },
  })
  const fideles5 = await Promise.all([
    db.user.create({ data: { email: 'aissata.zongo@email.bf', password: 'password123', firstName: 'Aïssata', lastName: 'Zongo', phone: '+226 70 33 44 55', address: 'Koulouba, Ouagadougou', dateOfBirth: '1997-09-05', gender: 'F', role: 'PAROISSIEN', isActive: true, emailVerified: true, churchId: church5.id } }),
  ])

  // ═══════════════════════════════════════════════════════════════════
  // SUBSCRIPTIONS & PAYMENTS
  // ═══════════════════════════════════════════════════════════════════

  const now = new Date()

  for (const church of churches) {
    if (church.plan !== 'FREE') {
      const sub = await db.subscription.create({
        data: {
          churchId: church.id,
          plan: church.plan,
          status: church.plan === 'PREMIUM' ? 'ACTIVE' : 'TRIALING',
          billingCycle: 'ANNUAL',
          currentPeriodStart: now,
          currentPeriodEnd: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()),
          trialEndsAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        },
      })
      await db.invoice.create({
        data: {
          subscriptionId: sub.id, churchId: church.id,
          amount: church.plan === 'PREMIUM' ? 1200000 : 600000,
          currency: 'XOF', status: 'PAID',
          invoiceNumber: `INV-2025-${church.id.slice(-4).toUpperCase()}`,
          paidAt: now,
          dueDate: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()),
        },
      })
    }

    // Payment configs
    await db.paymentConfig.create({
      data: { churchId: church.id, method: 'ORANGE_MONEY', config: JSON.stringify({ merchantCode: `OM-${church.slug.slice(0, 8)}`, apiKey: 'demo-key' }), isActive: true },
    })
    await db.paymentConfig.create({
      data: { churchId: church.id, method: 'STRIPE', config: JSON.stringify({ publicKey: 'pk_demo', secretKey: 'sk_demo' }), isActive: false },
    })
  }

  // ═══════════════════════════════════════════════════════════════════
  // GROUPS (for Church 1 - the most complete)
  // ═══════════════════════════════════════════════════════════════════

  const [aissatou, mamadou, fatou, ousmane, , khady, ibrahima] = fideles1

  const chorale1 = await db.group.create({
    data: { churchId: church1.id, adminId: ibrahima.id, name: 'Chorale Sainte Cécile', description: 'La chorale paroissiale animant les messes et célébrations', type: 'CHORALE', maxMembers: 40, isActive: true },
  })
  const scouts1 = await db.group.create({
    data: { churchId: church1.id, adminId: mamadou.id, name: 'Scouts et Guides du Sénégal', description: 'Mouvement scout de la paroisse', type: 'SCOUT', maxMembers: 60, isActive: true },
  })
  const lecteurs1 = await db.group.create({
    data: { churchId: church1.id, adminId: aissatou.id, name: 'Lecteurs de la Parole', description: 'Lecteurs et commentateurs pour les offices', type: 'LECTEURS', maxMembers: 20, isActive: true },
  })
  const jeunes1 = await db.group.create({
    data: { churchId: church1.id, adminId: khady.id, name: 'Jeunesse Saint Jean', description: 'Groupe des jeunes de la paroisse', type: 'JEUNES', maxMembers: 50, isActive: true },
  })

  // Group for Church 2
  const chorale2 = await db.group.create({
    data: { churchId: church2.id, adminId: fideles2[2].id, name: 'Chorale Saint Pierre', description: 'Chorale de la Paroisse Saint Pierre', type: 'CHORALE', maxMembers: 30, isActive: true },
  })
  const jeunes2 = await db.group.create({
    data: { churchId: church2.id, adminId: fideles2[2].id, name: 'Jeunesse Saint Pierre', description: 'Groupe des jeunes', type: 'JEUNES', maxMembers: 40, isActive: true },
  })

  // Group for Church 4
  const chorale4 = await db.group.create({
    data: { churchId: church4.id, adminId: fideles4[1].id, name: 'Chorale Sainte Famille', description: 'Chorale paroissiale', type: 'CHORALE', maxMembers: 50, isActive: true },
  })

  // Group Members (Church 1)
  await Promise.all([
    db.groupMember.create({ data: { groupId: chorale1.id, userId: ibrahima.id, role: 'ADMIN_GROUP', status: 'ACCEPTED', invitedById: admin1.id } }),
    db.groupMember.create({ data: { groupId: chorale1.id, userId: fatou.id, role: 'MEMBER', status: 'ACCEPTED', invitedById: ibrahima.id } }),
    db.groupMember.create({ data: { groupId: chorale1.id, userId: khady.id, role: 'MEMBER', status: 'ACCEPTED', invitedById: ibrahima.id } }),
    db.groupMember.create({ data: { groupId: scouts1.id, userId: mamadou.id, role: 'ADMIN_GROUP', status: 'ACCEPTED', invitedById: admin1.id } }),
    db.groupMember.create({ data: { groupId: scouts1.id, userId: ousmane.id, role: 'MEMBER', status: 'ACCEPTED', invitedById: mamadou.id } }),
    db.groupMember.create({ data: { groupId: lecteurs1.id, userId: aissatou.id, role: 'ADMIN_GROUP', status: 'ACCEPTED', invitedById: admin1.id } }),
    db.groupMember.create({ data: { groupId: lecteurs1.id, userId: mamadou.id, role: 'MEMBER', status: 'ACCEPTED', invitedById: aissatou.id } }),
    db.groupMember.create({ data: { groupId: jeunes1.id, userId: khady.id, role: 'ADMIN_GROUP', status: 'ACCEPTED', invitedById: admin1.id } }),
    db.groupMember.create({ data: { groupId: jeunes1.id, userId: fatou.id, role: 'MEMBER', status: 'ACCEPTED', invitedById: khady.id } }),
    db.groupMember.create({ data: { groupId: jeunes1.id, userId: ousmane.id, role: 'MEMBER', status: 'INVITED', invitedById: khady.id } }),
  ])

  // Group Members (Church 2)
  await Promise.all([
    db.groupMember.create({ data: { groupId: chorale2.id, userId: fideles2[2].id, role: 'ADMIN_GROUP', status: 'ACCEPTED', invitedById: admin2.id } }),
    db.groupMember.create({ data: { groupId: chorale2.id, userId: fideles2[0].id, role: 'MEMBER', status: 'ACCEPTED', invitedById: fideles2[2].id } }),
    db.groupMember.create({ data: { groupId: jeunes2.id, userId: fideles2[1].id, role: 'MEMBER', status: 'ACCEPTED', invitedById: admin2.id } }),
  ])

  // ═══════════════════════════════════════════════════════════════════
  // ACTIVITIES (for each church)
  // ═══════════════════════════════════════════════════════════════════

  const today = new Date()

  // Church 1 activities
  const activities1 = await Promise.all([
    db.activity.create({ data: { churchId: church1.id, createdById: admin1.id, title: 'Messe dominicale', description: 'Messe du dimanche présidée par le Père Mbaye', type: 'MESSE', startDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0).toISOString(), endDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0).toISOString(), location: 'Église principale', celebrandId: abbe1_1.id, visibility: 'PUBLIC' } }),
    db.activity.create({ data: { churchId: church1.id, createdById: admin1.id, title: 'Adoration du Saint-Sacrement', description: 'Heure d\'adoration silencieuse', type: 'ADORATION', startDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 18, 0).toISOString(), endDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 19, 0).toISOString(), location: 'Chapelle latérale', celebrandId: abbe1_2.id, visibility: 'PUBLIC' } }),
    db.activity.create({ data: { churchId: church1.id, createdById: abbe1_1.id, title: 'Confessions', description: 'Sacrement de réconciliation', type: 'CONFESSION', startDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 16, 0).toISOString(), endDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 18, 0).toISOString(), location: 'Confessionnaux', celebrandId: abbe1_1.id, visibility: 'MEMBERS_ONLY' } }),
    db.activity.create({ data: { churchId: church1.id, createdById: admin1.id, title: 'Catéchèse adultes', description: 'Formation continue pour adultes', type: 'CATECHESE', startDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 19, 0).toISOString(), endDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 20, 30).toISOString(), location: 'Salle paroissiale', visibility: 'MEMBERS_ONLY' } }),
    db.activity.create({ data: { churchId: church1.id, createdById: admin1.id, title: 'Fête paroissiale', description: 'Grande fête annuelle de la paroisse Saint Jean', type: 'EVENT_SPECIAL', startDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 10, 0).toISOString(), endDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 22, 0).toISOString(), location: 'Cour paroissiale', visibility: 'PUBLIC' } }),
  ])

  // Church 2 activities
  await Promise.all([
    db.activity.create({ data: { churchId: church2.id, createdById: admin2.id, title: 'Messe dominicale', description: 'Messe du dimanche', type: 'MESSE', startDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 30).toISOString(), endDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30).toISOString(), location: 'Église Saint Pierre', celebrandId: abbe2_1.id, visibility: 'PUBLIC' } }),
    db.activity.create({ data: { churchId: church2.id, createdById: admin2.id, title: 'Réunion de prière', description: 'Réunion de prière du mercredi', type: 'REUNION', startDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 18, 0).toISOString(), endDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 19, 30).toISOString(), location: 'Chapelle', visibility: 'MEMBERS_ONLY' } }),
  ])

  // Church 3 activities
  await Promise.all([
    db.activity.create({ data: { churchId: church3.id, createdById: admin3.id, title: 'Messe dominicale', description: 'Messe dominicale', type: 'MESSE', startDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30).toISOString(), endDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30).toISOString(), location: 'Église Notre Dame', celebrandId: abbe3_1.id, visibility: 'PUBLIC' } }),
  ])

  // Church 4 activities
  await Promise.all([
    db.activity.create({ data: { churchId: church4.id, createdById: admin4.id, title: 'Messe dominicale', description: 'Grande messe du dimanche', type: 'MESSE', startDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 0).toISOString(), endDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0).toISOString(), location: 'Église Sainte Famille', celebrandId: abbe4_1.id, visibility: 'PUBLIC' } }),
    db.activity.create({ data: { churchId: church4.id, createdById: admin4.id, title: 'Procession', description: 'Procession mensuelle', type: 'EVENT_SPECIAL', startDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 15, 0).toISOString(), endDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 18, 0).toISOString(), location: 'Parvis de l\'église', visibility: 'PUBLIC' } }),
  ])

  // ═══════════════════════════════════════════════════════════════════
  // APPOINTMENTS (Church 1)
  // ═══════════════════════════════════════════════════════════════════

  await Promise.all([
    db.appointment.create({ data: { userId: aissatou.id, abbeId: abbe1_1.id, churchId: church1.id, date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString().split('T')[0], startTime: '10:00', endTime: '10:30', motif: 'Direction spirituelle', status: 'CONFIRME' } }),
    db.appointment.create({ data: { userId: mamadou.id, abbeId: abbe1_1.id, churchId: church1.id, date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2).toISOString().split('T')[0], startTime: '14:00', endTime: '14:30', motif: 'Préparation au baptême de mon enfant', status: 'EN_ATTENTE' } }),
    db.appointment.create({ data: { userId: fatou.id, abbeId: abbe1_2.id, churchId: church1.id, date: new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().split('T')[0], startTime: '16:00', endTime: '16:30', motif: 'Conseil matrimonial', status: 'EN_ATTENTE' } }),
  ])

  // ═══════════════════════════════════════════════════════════════════
  // DONATIONS (across churches)
  // ═══════════════════════════════════════════════════════════════════

  const donationData = [
    // Church 1
    { userId: aissatou.id, churchId: church1.id, amount: 10000, method: 'ORANGE_MONEY' as const, daysAgo: 0 },
    { userId: mamadou.id, churchId: church1.id, amount: 25000, method: 'CASH' as const, daysAgo: 1 },
    { userId: fatou.id, churchId: church1.id, amount: 15000, method: 'ORANGE_MONEY' as const, daysAgo: 2 },
    { userId: ibrahima.id, churchId: church1.id, amount: 30000, method: 'ORANGE_MONEY' as const, daysAgo: 12 },
    { userId: null, churchId: church1.id, amount: 7500, method: 'ORANGE_MONEY' as const, daysAgo: 50 },
    // Church 2
    { userId: fideles2[0].id, churchId: church2.id, amount: 15000, method: 'ORANGE_MONEY' as const, daysAgo: 1 },
    { userId: fideles2[1].id, churchId: church2.id, amount: 20000, method: 'M_PESA' as const, daysAgo: 5 },
    // Church 3
    { userId: fideles3[0].id, churchId: church3.id, amount: 25000, method: 'CASH' as const, daysAgo: 3 },
    // Church 4
    { userId: fideles4[0].id, churchId: church4.id, amount: 50000, method: 'ORANGE_MONEY' as const, daysAgo: 0 },
    { userId: fideles4[1].id, churchId: church4.id, amount: 35000, method: 'CASH' as const, daysAgo: 7 },
  ]

  await Promise.all(
    donationData.map((d) =>
      db.donation.create({
        data: {
          userId: d.userId,
          churchId: d.churchId,
          amount: d.amount,
          currency: 'XOF',
          method: d.method,
          status: 'SUCCESS',
          isAnonymous: d.userId === null,
          createdAt: new Date(today.getTime() - d.daysAgo * 24 * 60 * 60 * 1000),
        },
      })
    )
  )

  // Quêtes (Church 1)
  await Promise.all([
    db.quete.create({ data: { churchId: church1.id, recordedById: admin1.id, date: new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().split('T')[0], massTime: '09:00', celebrantId: abbe1_1.id, ordinaryAmount: 45000, specialAmount: 20000, specialIntention: 'Pour les malades de la paroisse', massOfferingAmount: 15000, totalAmount: 80000 } }),
    db.quete.create({ data: { churchId: church1.id, recordedById: admin1.id, date: new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().split('T')[0], massTime: '11:00', celebrantId: abbe1_2.id, ordinaryAmount: 35000, specialAmount: 10000, massOfferingAmount: 10000, totalAmount: 55000 } }),
  ])

  // ═══════════════════════════════════════════════════════════════════
  // CERTIFICATES (Church 1)
  // ═══════════════════════════════════════════════════════════════════

  await Promise.all([
    db.certificate.create({ data: { churchId: church1.id, userId: aissatou.id, type: 'BAPTISM', details: JSON.stringify({ dateBapteme: '1990-06-15', parrain: 'Abdou Ndiaye', marraine: 'Coumba Fall', celebrant: 'Père Dupont' }), status: 'DEMANDED', fee: 2000, feePaid: true } }),
    db.certificate.create({ data: { churchId: church1.id, userId: mamadou.id, type: 'MARRIAGE', details: JSON.stringify({ dateMariage: '2015-12-20', conjoint: 'Aminata Traoré', celebrant: 'Père Mbaye' }), status: 'VERIFIED', fee: 5000, feePaid: true, approvedById: abbe1_1.id } }),
    db.certificate.create({ data: { churchId: church1.id, userId: fatou.id, type: 'CONFIRMATION', details: JSON.stringify({ dateConfirmation: '2010-05-30', eveque: 'Mgr Théodore Adrien Sarr', parrain: 'Ibrahima Guèye' }), status: 'APPROVED', fee: 3000, feePaid: true, approvedById: abbe1_1.id } }),
  ])

  // ═══════════════════════════════════════════════════════════════════
  // CEMETERY (Church 1)
  // ═══════════════════════════════════════════════════════════════════

  const concession1 = await db.cemeteryConcession.create({
    data: { churchId: church1.id, ownerId: ousmane.id, location: 'Cimetière Saint Jean - Section A', plotNumber: 'A-42', startDate: '2020-01-01', endDate: '2040-01-01', duration: '20 ans', status: 'ACTIVE', notes: 'Concession familiale Ba' },
  })
  await db.defunt.create({ data: { concessionId: concession1.id, firstName: 'Amadou', lastName: 'Ba', birthDate: '1945-03-10', deathDate: '2021-11-15', burialDate: '2021-11-18', notes: 'Père de Ousmane Ba' } })

  // ═══════════════════════════════════════════════════════════════════
  // NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════════

  await Promise.all([
    db.notification.create({ data: { userId: admin1.id, type: 'RDV', title: 'Nouveau rendez-vous', body: 'Mamadou Sy a demandé un rendez-vous', link: '/appointments', isRead: false } }),
    db.notification.create({ data: { userId: admin1.id, type: 'CERTIFICATE', title: 'Demande de certificat', body: 'Aissatou Fall demande un certificat de baptême', link: '/certificates', isRead: false } }),
    db.notification.create({ data: { userId: admin1.id, type: 'DONATION', title: 'Don reçu', body: 'Un don de 10 000 XOF a été reçu via Orange Money', link: '/donations', isRead: true, readAt: new Date() } }),
  ])

  // ═══════════════════════════════════════════════════════════════════
  // MESSAGES
  // ═══════════════════════════════════════════════════════════════════

  await Promise.all([
    db.message.create({ data: { senderId: abbe1_1.id, receiverId: admin1.id, content: 'Bonjour Marie, pouvez-vous préparer les documents pour la messe de dimanche ?', isRead: true, readAt: new Date() } }),
    db.message.create({ data: { senderId: admin1.id, receiverId: abbe1_1.id, content: 'Bien sûr Père, je m\'en occupe immédiatement.', isRead: true, readAt: new Date() } }),
    db.message.create({ data: { senderId: khady.id, groupId: jeunes1.id, content: 'Salut tout le monde ! N\'oubliez pas la réunion de vendredi soir 🙏', isRead: false } }),
  ])

  // ═══════════════════════════════════════════════════════════════════
  // AUDIT LOGS
  // ═══════════════════════════════════════════════════════════════════

  await Promise.all([
    db.auditLog.create({ data: { churchId: church1.id, userId: admin1.id, action: 'CREATE', entity: 'Activity', entityId: activities1[0].id, newValues: JSON.stringify({ title: 'Messe dominicale' }) } }),
  ])

  console.log('✅ Seed completed successfully with 5 parishes!')

  return {
    success: true,
    message: 'Base de données peuplée avec succès (5 paroisses)',
    stats: {
      churches: 5,
      users: '23+',
      groups: 7,
      activities: 9,
    },
  }
}
