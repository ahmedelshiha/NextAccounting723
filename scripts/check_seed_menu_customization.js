const { PrismaClient } = require('@prisma/client')

;(async () => {
  const { default: prisma } = await import('../src/lib/prisma')
  try {
    console.log('Checking for table menu_customizations...')
    const res = await prisma.$queryRawUnsafe("SELECT to_regclass('public.menu_customizations')::text as tbl")
    const tableName = Array.isArray(res) ? res[0].tbl : res.tbl
    if (!tableName) {
      console.error('Table menu_customizations does NOT exist.')
      process.exitCode = 2
      return
    }

    console.log('Table exists:', tableName)

    // Ensure test tenant exists
    const tenantSlug = 'test-tenant'
    let tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } })
    if (!tenant) {
      console.log('Creating test tenant...')
      tenant = await prisma.tenant.create({ data: { slug: tenantSlug, name: 'Test Tenant' } })
      console.log('Created tenant id=', tenant.id)
    } else {
      console.log('Using existing tenant id=', tenant.id)
    }

    // Ensure test user exists (use specific id to match menu customization FK)
    const userId = 'test-user-menu-customization'
    let user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      console.log('Creating test user with id=', userId)
      user = await prisma.user.create({
        data: {
          id: userId,
          tenantId: tenant.id,
          email: 'test-user@example.com',
          name: 'Test User',
        },
      })
      console.log('Created user id=', user.id)

      // Also create tenant membership
      try {
        await prisma.tenantMembership.create({ data: { userId: user.id, tenantId: tenant.id, isDefault: true } })
      } catch (e) {
        // ignore if exists
      }
    } else {
      console.log('Using existing user id=', user.id)
    }

    // Upsert a test record
    const testData = {
      sectionOrder: ['dashboard','business','financial','operations','system'],
      hiddenItems: ['admin/analytics'],
      practiceItems: [
        {
          id: 'practice-clients',
          name: 'Clients',
          icon: 'Users',
          href: '/admin/clients',
          order: 0,
          visible: true,
        },
      ],
      bookmarks: [
        {
          id: 'bookmark-1',
          name: 'Bookings',
          href: '/admin/bookings',
          icon: 'Calendar',
          order: 0,
        },
      ],
    }

    console.log('Upserting test menu customization for userId=', userId)
    const upserted = await prisma.menuCustomization.upsert({
      where: { userId },
      update: {
        sectionOrder: testData.sectionOrder,
        hiddenItems: testData.hiddenItems,
        practiceItems: testData.practiceItems,
        bookmarks: testData.bookmarks,
      },
      create: {
        userId,
        sectionOrder: testData.sectionOrder,
        hiddenItems: testData.hiddenItems,
        practiceItems: testData.practiceItems,
        bookmarks: testData.bookmarks,
      },
    })

    console.log('Upsert successful. ID:', upserted.id)

    // Fetch and display the record
    const fetched = await prisma.menuCustomization.findUnique({ where: { userId } })
    console.log('Fetched record:', JSON.stringify(fetched, null, 2))
  } catch (err) {
    console.error('Error during check/seed:', err)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
})()
