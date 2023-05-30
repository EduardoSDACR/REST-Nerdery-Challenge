import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

export async function clearDatabase(schema = 'testing'): Promise<void> {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname=${schema}`

  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      try {
        await prisma.$executeRawUnsafe(
          `TRUNCATE TABLE "${schema}"."${tablename}" CASCADE;`,
        )
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error({ error })
      }
    }
  }
}
