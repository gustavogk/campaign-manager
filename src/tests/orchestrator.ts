import prisma from "../lib/prisma";

async function cleanDatabase() {
  await prisma.campaign.deleteMany();
}

export { cleanDatabase };
