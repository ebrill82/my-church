import { db } from '@/lib/db'

export async function seedDatabase() {
  console.log('🌱 Seeding database...')

  // Clean existing data (order matters due to foreign keys)
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
  const planLimits = await Promise.all([
    db.planLimit.create({ data: { plan: 'FREE', featureKey: 'max_members', maxValue: 100, description: 'Maximum de paroissiens' } }),
    db.planLimit.create({ data: { plan: 'FREE', featureKey: 'max_groups', maxValue: 3, description: 'Maximum de groupes' } }),
    db.planLimit.create({ data: { plan: 'STANDARD', featureKey: 'max_members', maxValue: 500, description: 'Maximum de paroissiens' } }),
    db.planLimit.create({ data: { plan: 'STANDARD', featureKey: 'max_groups', maxValue: 10, description: 'Maximum de groupes' } }),
    db.planLimit.create({ data: { plan: 'PREMIUM', featureKey: 'max_members', maxValue: 5000, description: 'Maximum de paroissiens' } }),
    db.planLimit.create({ data: { plan: 'PREMIUM', featureKey: 'max_groups', maxValue: 50, description: 'Maximum de groupes' } }),
    db.planLimit.create({ data: { plan: 'DIOCESE', featureKey: 'max_members', maxValue: 100000, description: 'Maximum de paroissiens' } }),
    db.planLimit.create({ data: { plan: 'DIOCESE', featureKey: 'max_groups', maxValue: 999, description: 'Maximum de groupes' } }),
  ])

  // ---- Church ----
  const church = await db.church.create({
    data: {
      name: 'Paroisse Saint Jean',
      slug: 'saint-jean',
      address: '45 Rue Blanchot, Dakar, Sénégal',
      phone: '+221 33 821 45 67',
      email: 'contact@saintjean.sn',
      website: 'https://saintjean.sn',
      diocese: 'Archidiocèse de Dakar',
      numberOfFaithful: 1200,
      logoUrl: '/logo-saint-jean.png',
      photoUrl: '/eglise-saint-jean.jpg',
      motto: 'Ubique Caritas et Deus',
      description: 'Paroisse Saint Jean - Au cœur de Dakar, une communauté vivante au service de Dieu et des hommes.',
      primaryColor: '#1B3A5C',
      secondaryColor: '#C9A84C',
      plan: 'PREMIUM',
    },
  })

  // ---- Users ----
  const adminUser = await db.user.create({
    data: {
      email: 'admin@saintjean.sn',
      password: 'password123',
      firstName: 'Marie',
      lastName: 'Diop',
      phone: '+221 77 123 45 67',
      address: '12 Rue Carnot, Dakar',
      dateOfBirth: '1985-03-15',
      gender: 'F',
      role: 'ADMIN_PAROISSE',
      isActive: true,
      emailVerified: true,
      churchId: church.id,
    },
  })

  const abbe1 = await db.user.create({
    data: {
      email: 'pere.mbaye@saintjean.sn',
      password: 'password123',
      firstName: 'Jean',
      lastName: 'Mbaye',
      phone: '+221 77 234 56 78',
      address: '45 Rue Blanchot, Dakar',
      dateOfBirth: '1970-06-20',
      gender: 'M',
      avatarUrl: '/pere-mbaye.jpg',
      role: 'ABBE',
      isActive: true,
      emailVerified: true,
      churchId: church.id,
    },
  })

  const abbe2 = await db.user.create({
    data: {
      email: 'pere.sow@saintjean.sn',
      password: 'password123',
      firstName: 'Paul',
      lastName: 'Sow',
      phone: '+221 77 345 67 89',
      address: '45 Rue Blanchot, Dakar',
      dateOfBirth: '1975-09-10',
      gender: 'M',
      avatarUrl: '/pere-sow.jpg',
      role: 'ABBE',
      isActive: true,
      emailVerified: true,
      churchId: church.id,
    },
  })

  // Parishioners
  const parishioners = await Promise.all([
    db.user.create({
      data: {
        email: 'aissatou.fall@email.sn',
        password: 'password123',
        firstName: 'Aissatou',
        lastName: 'Fall',
        phone: '+221 76 111 22 33',
        address: '78 Rue Pompidou, Dakar',
        dateOfBirth: '1990-01-05',
        gender: 'F',
        role: 'PAROISSIEN',
        isActive: true,
        emailVerified: true,
        churchId: church.id,
      },
    }),
    db.user.create({
      data: {
        email: 'mamadou.sy@email.sn',
        password: 'password123',
        firstName: 'Mamadou',
        lastName: 'Sy',
        phone: '+221 76 222 33 44',
        address: '15 Avenue L.S. Senghor, Dakar',
        dateOfBirth: '1988-04-12',
        gender: 'M',
        role: 'PAROISSIEN',
        isActive: true,
        emailVerified: true,
        churchId: church.id,
      },
    }),
    db.user.create({
      data: {
        email: 'fatou.ndiaye@email.sn',
        password: 'password123',
        firstName: 'Fatou',
        lastName: 'Ndiaye',
        phone: '+221 76 333 44 55',
        address: '22 Rue Dr. Theze, Dakar',
        dateOfBirth: '1995-07-22',
        gender: 'F',
        role: 'PAROISSIEN',
        isActive: true,
        emailVerified: true,
        churchId: church.id,
      },
    }),
    db.user.create({
      data: {
        email: 'ousmane.ba@email.sn',
        password: 'password123',
        firstName: 'Ousmane',
        lastName: 'Ba',
        phone: '+221 76 444 55 66',
        address: '5 Rue Sandiniéry, Dakar',
        dateOfBirth: '1982-11-30',
        gender: 'M',
        role: 'PAROISSIEN',
        isActive: true,
        emailVerified: false,
        churchId: church.id,
      },
    }),
    db.user.create({
      data: {
        email: 'adama.diallo@email.sn',
        password: 'password123',
        firstName: 'Adama',
        lastName: 'Diallo',
        phone: '+221 76 555 66 77',
        address: '90 Rue Victor Hugo, Dakar',
        dateOfBirth: '1992-05-18',
        gender: 'M',
        role: 'PAROISSIEN',
        isActive: false,
        emailVerified: true,
        churchId: church.id,
      },
    }),
    db.user.create({
      data: {
        email: 'khady.sarr@email.sn',
        password: 'password123',
        firstName: 'Khady',
        lastName: 'Sarr',
        phone: '+221 76 666 77 88',
        address: '33 Rue de Thann, Dakar',
        dateOfBirth: '1998-02-14',
        gender: 'F',
        role: 'PAROISSIEN',
        isActive: true,
        emailVerified: true,
        churchId: church.id,
      },
    }),
    db.user.create({
      data: {
        email: 'ibrahima.gueye@email.sn',
        password: 'password123',
        firstName: 'Ibrahima',
        lastName: 'Guèye',
        phone: '+221 76 777 88 99',
        address: '67 Avenue Bourguiba, Dakar',
        dateOfBirth: '1980-08-25',
        gender: 'M',
        role: 'DIRIGEANT_GROUPE',
        isActive: true,
        emailVerified: true,
        churchId: church.id,
      },
    }),
  ])

  const [aissatou, mamadou, fatou, ousmane, adama, khady, ibrahima] = parishioners

  // ---- Subscription ----
  const now = new Date()
  const subscription = await db.subscription.create({
    data: {
      churchId: church.id,
      plan: 'PREMIUM',
      status: 'ACTIVE',
      billingCycle: 'ANNUAL',
      currentPeriodStart: now,
      currentPeriodEnd: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()),
      trialEndsAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    },
  })

  // ---- Invoice ----
  await db.invoice.create({
    data: {
      subscriptionId: subscription.id,
      churchId: church.id,
      amount: 150000,
      currency: 'XOF',
      status: 'PAID',
      invoiceNumber: 'INV-2025-001',
      paidAt: now,
      dueDate: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()),
    },
  })

  // ---- Payment Config ----
  await db.paymentConfig.create({
    data: {
      churchId: church.id,
      method: 'ORANGE_MONEY',
      config: JSON.stringify({ merchantCode: 'OM-STJEAN', apiKey: 'demo-key' }),
      isActive: true,
    },
  })
  await db.paymentConfig.create({
    data: {
      churchId: church.id,
      method: 'STRIPE',
      config: JSON.stringify({ publicKey: 'pk_demo', secretKey: 'sk_demo' }),
      isActive: false,
    },
  })

  // ---- Groups ----
  const chorale = await db.group.create({
    data: {
      churchId: church.id,
      adminId: ibrahima.id,
      name: 'Chorale Sainte Cécile',
      description: 'La chorale paroissiale animant les messes et célébrations',
      type: 'CHORALE',
      maxMembers: 40,
      isActive: true,
    },
  })

  const scouts = await db.group.create({
    data: {
      churchId: church.id,
      adminId: mamadou.id,
      name: 'Scouts et Guides du Sénégal',
      description: 'Mouvement scout de la paroisse',
      type: 'SCOUT',
      maxMembers: 60,
      isActive: true,
    },
  })

  const lecteurs = await db.group.create({
    data: {
      churchId: church.id,
      adminId: aissatou.id,
      name: 'Lecteurs de la Parole',
      description: 'Lecteurs et commentateurs pour les offices',
      type: 'LECTEURS',
      maxMembers: 20,
      isActive: true,
    },
  })

  const jeunes = await db.group.create({
    data: {
      churchId: church.id,
      adminId: khady.id,
      name: 'Jeunesse Saint Jean',
      description: 'Groupe des jeunes de la paroisse',
      type: 'JEUNES',
      maxMembers: 50,
      isActive: true,
    },
  })

  // ---- Group Members ----
  await Promise.all([
    db.groupMember.create({ data: { groupId: chorale.id, userId: ibrahima.id, role: 'ADMIN_GROUP', status: 'ACCEPTED', invitedById: adminUser.id } }),
    db.groupMember.create({ data: { groupId: chorale.id, userId: fatou.id, role: 'MEMBER', status: 'ACCEPTED', invitedById: ibrahima.id } }),
    db.groupMember.create({ data: { groupId: chorale.id, userId: khady.id, role: 'MEMBER', status: 'ACCEPTED', invitedById: ibrahima.id } }),
    db.groupMember.create({ data: { groupId: scouts.id, userId: mamadou.id, role: 'ADMIN_GROUP', status: 'ACCEPTED', invitedById: adminUser.id } }),
    db.groupMember.create({ data: { groupId: scouts.id, userId: ousmane.id, role: 'MEMBER', status: 'ACCEPTED', invitedById: mamadou.id } }),
    db.groupMember.create({ data: { groupId: lecteurs.id, userId: aissatou.id, role: 'ADMIN_GROUP', status: 'ACCEPTED', invitedById: adminUser.id } }),
    db.groupMember.create({ data: { groupId: lecteurs.id, userId: mamadou.id, role: 'MEMBER', status: 'ACCEPTED', invitedById: aissatou.id } }),
    db.groupMember.create({ data: { groupId: jeunes.id, userId: khady.id, role: 'ADMIN_GROUP', status: 'ACCEPTED', invitedById: adminUser.id } }),
    db.groupMember.create({ data: { groupId: jeunes.id, userId: fatou.id, role: 'MEMBER', status: 'ACCEPTED', invitedById: khady.id } }),
    db.groupMember.create({ data: { groupId: jeunes.id, userId: ousmane.id, role: 'MEMBER', status: 'INVITED', invitedById: khady.id } }),
  ])

  // ---- Activities ----
  const today = new Date()
  const activities = await Promise.all([
    db.activity.create({
      data: {
        churchId: church.id,
        createdById: adminUser.id,
        title: 'Messe dominicale',
        description: 'Messe du dimanche présidée par le Père Mbaye',
        type: 'MESSE',
        startDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0).toISOString(),
        endDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0).toISOString(),
        location: 'Église principale',
        celebrandId: abbe1.id,
        visibility: 'PUBLIC',
      },
    }),
    db.activity.create({
      data: {
        churchId: church.id,
        createdById: adminUser.id,
        title: 'Adoration du Saint-Sacrement',
        description: 'Heure d\'adoration silencieuse',
        type: 'ADORATION',
        startDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 18, 0).toISOString(),
        endDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 19, 0).toISOString(),
        location: 'Chapelle latérale',
        celebrandId: abbe2.id,
        visibility: 'PUBLIC',
      },
    }),
    db.activity.create({
      data: {
        churchId: church.id,
        createdById: abbe1.id,
        title: 'Confessions',
        description: 'Sacrement de réconciliation',
        type: 'CONFESSION',
        startDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 16, 0).toISOString(),
        endDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 18, 0).toISOString(),
        location: 'Confessionnaux',
        celebrandId: abbe1.id,
        visibility: 'MEMBERS_ONLY',
      },
    }),
    db.activity.create({
      data: {
        churchId: church.id,
        createdById: adminUser.id,
        title: 'Catéchèse adultes',
        description: 'Formation continue pour adultes',
        type: 'CATECHESE',
        startDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 19, 0).toISOString(),
        endDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 20, 30).toISOString(),
        location: 'Salle paroissiale',
        visibility: 'MEMBERS_ONLY',
      },
    }),
    db.activity.create({
      data: {
        churchId: church.id,
        createdById: adminUser.id,
        title: 'Réunion chorale',
        description: 'Répétition de la chorale Sainte Cécile',
        type: 'REUNION',
        startDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4, 19, 30).toISOString(),
        endDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4, 21, 0).toISOString(),
        location: 'Salle de musique',
        groupId: chorale.id,
        visibility: 'GROUP_ONLY',
      },
    }),
    db.activity.create({
      data: {
        churchId: church.id,
        createdById: adminUser.id,
        title: 'Fête paroissiale',
        description: 'Grande fête annuelle de la paroisse Saint Jean',
        type: 'EVENT_SPECIAL',
        startDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 10, 0).toISOString(),
        endDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 22, 0).toISOString(),
        location: 'Cour paroissiale',
        visibility: 'PUBLIC',
      },
    }),
  ])

  // ---- Appointments ----
  await Promise.all([
    db.appointment.create({
      data: {
        userId: aissatou.id,
        abbeId: abbe1.id,
        churchId: church.id,
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '10:30',
        motif: 'Direction spirituelle',
        status: 'CONFIRME',
      },
    }),
    db.appointment.create({
      data: {
        userId: mamadou.id,
        abbeId: abbe1.id,
        churchId: church.id,
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2).toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '14:30',
        motif: 'Préparation au baptême de mon enfant',
        status: 'EN_ATTENTE',
      },
    }),
    db.appointment.create({
      data: {
        userId: fatou.id,
        abbeId: abbe2.id,
        churchId: church.id,
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().split('T')[0],
        startTime: '16:00',
        endTime: '16:30',
        motif: 'Conseil matrimonial',
        status: 'EN_ATTENTE',
      },
    }),
    db.appointment.create({
      data: {
        userId: ousmane.id,
        abbeId: abbe1.id,
        churchId: church.id,
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1).toISOString().split('T')[0],
        startTime: '11:00',
        endTime: '11:30',
        motif: 'Demande de certificat de baptême',
        notes: 'Pour dossier administratif',
        status: 'TERMINE',
      },
    }),
  ])

  // ---- Donations ----
  const donationData = [
    { userId: aissatou.id, amount: 10000, method: 'ORANGE_MONEY' as const, daysAgo: 0 },
    { userId: mamadou.id, amount: 25000, method: 'CASH' as const, daysAgo: 1 },
    { userId: fatou.id, amount: 15000, method: 'ORANGE_MONEY' as const, daysAgo: 2 },
    { userId: ousmane.id, amount: 5000, method: 'CASH' as const, daysAgo: 5 },
    { userId: khady.id, amount: 20000, method: 'M_PESA' as const, daysAgo: 8 },
    { userId: ibrahima.id, amount: 30000, method: 'ORANGE_MONEY' as const, daysAgo: 12 },
    { userId: aissatou.id, amount: 10000, method: 'CASH' as const, daysAgo: 20 },
    { userId: mamadou.id, amount: 50000, method: 'ORANGE_MONEY' as const, daysAgo: 35 },
    { userId: fatou.id, amount: 20000, method: 'CASH' as const, daysAgo: 45 },
    { userId: null, amount: 7500, method: 'ORANGE_MONEY' as const, daysAgo: 50 },
  ]

  await Promise.all(
    donationData.map((d) =>
      db.donation.create({
        data: {
          userId: d.userId,
          churchId: church.id,
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

  // ---- Quêtes ----
  await Promise.all([
    db.quete.create({
      data: {
        churchId: church.id,
        recordedById: adminUser.id,
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().split('T')[0],
        massTime: '09:00',
        celebrantId: abbe1.id,
        ordinaryAmount: 45000,
        specialAmount: 20000,
        specialIntention: 'Pour les malades de la paroisse',
        massOfferingAmount: 15000,
        totalAmount: 80000,
      },
    }),
    db.quete.create({
      data: {
        churchId: church.id,
        recordedById: adminUser.id,
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().split('T')[0],
        massTime: '11:00',
        celebrantId: abbe2.id,
        ordinaryAmount: 35000,
        specialAmount: 10000,
        massOfferingAmount: 10000,
        totalAmount: 55000,
      },
    }),
  ])

  // ---- Certificates ----
  await Promise.all([
    db.certificate.create({
      data: {
        churchId: church.id,
        userId: aissatou.id,
        type: 'BAPTISM',
        details: JSON.stringify({ dateBapteme: '1990-06-15', parrain: 'Abdou Ndiaye', marraine: 'Coumba Fall', celebrant: 'Père Dupont' }),
        status: 'DEMANDED',
        fee: 2000,
        feePaid: true,
      },
    }),
    db.certificate.create({
      data: {
        churchId: church.id,
        userId: mamadou.id,
        type: 'MARRIAGE',
        details: JSON.stringify({ dateMariage: '2015-12-20', conjoint: 'Aminata Traoré', celebrant: 'Père Mbaye' }),
        status: 'VERIFIED',
        fee: 5000,
        feePaid: true,
        approvedById: abbe1.id,
      },
    }),
    db.certificate.create({
      data: {
        churchId: church.id,
        userId: fatou.id,
        type: 'CONFIRMATION',
        details: JSON.stringify({ dateConfirmation: '2010-05-30', eveque: 'Mgr Théodore Adrien Sarr', parrain: 'Ibrahima Guèye' }),
        status: 'APPROVED',
        fee: 3000,
        feePaid: true,
        approvedById: abbe1.id,
      },
    }),
  ])

  // ---- Cemetery Concessions ----
  const concession1 = await db.cemeteryConcession.create({
    data: {
      churchId: church.id,
      ownerId: ousmane.id,
      location: 'Cimetière Saint Jean - Section A',
      plotNumber: 'A-42',
      startDate: '2020-01-01',
      endDate: '2040-01-01',
      duration: '20 ans',
      status: 'ACTIVE',
      notes: 'Concession familiale Ba',
    },
  })

  await db.defunt.create({
    data: {
      concessionId: concession1.id,
      firstName: 'Amadou',
      lastName: 'Ba',
      birthDate: '1945-03-10',
      deathDate: '2021-11-15',
      burialDate: '2021-11-18',
      notes: 'Père de Ousmane Ba',
    },
  })

  // ---- Notifications ----
  await Promise.all([
    db.notification.create({
      data: { userId: adminUser.id, type: 'RDV', title: 'Nouveau rendez-vous', body: 'Mamadou Sy a demandé un rendez-vous', link: '/appointments', isRead: false },
    }),
    db.notification.create({
      data: { userId: adminUser.id, type: 'CERTIFICATE', title: 'Demande de certificat', body: 'Aissatou Fall demande un certificat de baptême', link: '/certificates', isRead: false },
    }),
    db.notification.create({
      data: { userId: aissatou.id, type: 'ACTIVITY', title: 'Rappel d\'activité', body: 'Messe dominicale demain à 9h', link: '/activities', isRead: true, readAt: new Date() },
    }),
    db.notification.create({
      data: { userId: khady.id, type: 'GROUP_INVITE', title: 'Invitation au groupe', body: 'Vous avez été invité au groupe Scouts et Guides', link: '/groups', isRead: false },
    }),
    db.notification.create({
      data: { userId: adminUser.id, type: 'DONATION', title: 'Don reçu', body: 'Un don de 10 000 XOF a été reçu via Orange Money', link: '/donations', isRead: true, readAt: new Date() },
    }),
  ])

  // ---- Messages ----
  await Promise.all([
    db.message.create({
      data: { senderId: abbe1.id, receiverId: adminUser.id, content: 'Bonjour Marie, pouvez-vous préparer les documents pour la messe de dimanche ?', isRead: true, readAt: new Date() },
    }),
    db.message.create({
      data: { senderId: adminUser.id, receiverId: abbe1.id, content: 'Bien sûr Père, je m\'en occupe immédiatement.', isRead: true, readAt: new Date() },
    }),
    db.message.create({
      data: { senderId: khady.id, groupId: jeunes.id, content: 'Salut tout le monde ! N\'oubliez pas la réunion de vendredi soir 🙏', isRead: false },
    }),
  ])

  // ---- Audit Logs ----
  await Promise.all([
    db.auditLog.create({
      data: { churchId: church.id, userId: adminUser.id, action: 'CREATE', entity: 'Activity', entityId: activities[0].id, newValues: JSON.stringify({ title: 'Messe dominicale' }) },
    }),
    db.auditLog.create({
      data: { churchId: church.id, userId: adminUser.id, action: 'UPDATE', entity: 'User', entityId: aissatou.id, oldValues: JSON.stringify({ isActive: false }), newValues: JSON.stringify({ isActive: true }) },
    }),
  ])

  console.log('✅ Seed completed successfully!')

  return {
    success: true,
    message: 'Base de données peuplée avec succès',
    stats: {
      churches: 1,
      users: 3 + parishioners.length,
      groups: 4,
      activities: activities.length,
      planLimits: planLimits.length,
    },
  }
}
