import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function save(id: string, srcUrl: string): Promise<boolean> {
  try {
    await prisma.shortenedUrl.create({
      data: {
        id,
        srcurl: srcUrl,
      },
    });
    return true;
  } catch (error) {
    console.error("Error saving to database:", error);
    return false;
  }
}

export async function getOriginalUrl(id: string) {
  try {
    return await prisma.shortenedUrl.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Error retrieving URL:", error);
    return null;
  }
}

export { prisma };
