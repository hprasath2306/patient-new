import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./generated/prisma/client.ts";

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(serverRoot, ".env") });

/**
 * Resolve SQLite `file:` URLs relative to the server root so the DB path is
 * correct even when `process.cwd()` is the monorepo root or another folder.
 */
function resolveSqliteUrl(url) {
  const raw = (url && String(url).trim()) || "file:./dev.db";
  if (!raw.startsWith("file:")) return raw;
  const p = raw.slice("file:".length);
  if (path.isAbsolute(p)) return `file:${p}`;
  return `file:${path.join(serverRoot, p.replace(/^\.\//, ""))}`;
}

const globalForPrisma = globalThis;

function createClient() {
  const adapter = new PrismaBetterSqlite3({
    url: resolveSqliteUrl(process.env.DATABASE_URL),
  });
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
