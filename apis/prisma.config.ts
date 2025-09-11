import path from "node:path";
import dotenv from "dotenv";
import type { PrismaConfig } from "prisma";

const envFile =
  process.env.NODE_ENV === "test"
    ? path.resolve(process.cwd(), ".env.test")
    : path.resolve(process.cwd(), ".env");


dotenv.config({ path: envFile });

export default {
  schema: path.join("prisma"),
} satisfies PrismaConfig;
