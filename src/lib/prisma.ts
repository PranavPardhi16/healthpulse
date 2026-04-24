import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  // 1. Get the database URL (defaulting to the local file)
  const dbUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';
  
  // 2. Initialize the adapter by passing the URL directly
  const adapter = new PrismaBetterSqlite3({ url: dbUrl });
  
  // 3. Pass the adapter to the PrismaClient constructor
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;