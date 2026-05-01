import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

export const serverRoot = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(serverRoot, ".env") });
