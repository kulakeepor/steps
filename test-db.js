const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log('✓ Database connected:', result[0]);

    const count = await prisma.user.count();
    console.log('✓ Users in database:', count);

    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    if (admin) {
      console.log('✓ Admin found:', admin.email);
    } else {
      console.log('✗ No admin found');
    }

  } catch (error) {
    console.error('✗ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
