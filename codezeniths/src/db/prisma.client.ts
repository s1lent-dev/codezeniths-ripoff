import { PrismaClient} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = "postgres://4704cd08aea9c4b522b6ead876a60ef467617e61cec6fba87d87012d1487ba8d:sk_nRs_zBNS4H_oM5sCW73oZ@db.prisma.io:5432/postgres?sslmode=require";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter, log: ['query', 'info', 'warn', 'error'] });

export { prisma };
