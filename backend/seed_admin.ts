import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@ecosphere.com';
  const password = 'admin';

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'System Admin',
        role: 'admin',
        isActive: true,
      }
    });
    console.log('Admin user created successfully.');
  } else {
    console.log('Admin user already exists.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
