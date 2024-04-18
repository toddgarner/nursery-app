import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = "nurseryncf@gmail.com";
  const phone = "1234567890";
  const name = "NCF Nursery";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("ncfnursery", 10);

  // Create roles
  const guardianRole = await prisma.role.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: "Guardian" },
  });

  const adminRole = await prisma.role.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: "Admin" },
  });

  const user = await prisma.user.create({
    data: {
      email,
      phone,
      name,
      roleId: 1, // Assign the Admin role to the user
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
