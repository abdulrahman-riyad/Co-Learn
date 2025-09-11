import { PrismaClient } from "@prisma/client"
import dotenv from "dotenv";
import path from 'node:path'
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
dotenv.config({ path: path.resolve(process.cwd(), envFile) })


const db = process.env.DATABASE_URL;

if (!db) {
  throw new Error("Database URL is not defined in environment variables.");
}

const prisma = new PrismaClient({ datasources: { db: { url: db } } });

export default prisma;