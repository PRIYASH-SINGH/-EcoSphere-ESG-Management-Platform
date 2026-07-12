import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@ecosphere.com';
  const password = 'admin123'; // Must be 6+ chars for Zod validation

  const hashedPassword = await bcrypt.hash(password, 10);
  
  await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
    },
    create: {
      email,
      password: hashedPassword,
      name: 'System Admin',
      role: 'admin',
      isActive: true,
    }
  });
  console.log('Admin user updated with password "admin123".');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
