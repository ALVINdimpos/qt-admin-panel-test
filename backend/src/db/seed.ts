import { PrismaClient } from '@prisma/client';
import { hashEmail, signDigest, getPublicKey } from '../lib/crypto';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // Initialize crypto keypair
  const { initKeypair } = await import('../lib/crypto');
  initKeypair();

  // Create sample users
  const users = [
    {
      email: 'admin@qt.com',
      role: 'admin',
      status: 'active',
    },
    {
      email: 'user1@qt.com',
      role: 'user',
      status: 'active',
    },
    {
      email: 'user2@qt.com',
      role: 'user',
      status: 'inactive',
    },
  ];

  for (const userData of users) {
    const digest = hashEmail(userData.email);
    const signature = signDigest(digest);
    const publicKey = getPublicKey();

    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        emailHash: digest,
        signature,
        publicKey,
      },
    });
  }

  console.log('✅ Database seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
