// This snippet ensures that only one instance (singleton) of the Prisma client 
// exists when running in both production and development environments. 
// The fact is that in development mode, due to HMR, when the module 
// importing prisma is reloaded, a new client instance will be created.

import { PrismaClient } from '@prisma/client'
declare let global: { prisma: PrismaClient }

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

export default prisma