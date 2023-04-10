import path from "node:path";
import fs from "node:fs";

export const CACHE_DIRECTORY = process.env.CACHE_DIRECTORY
  ? process.env.CACHE_DIRECTORY
  : path.join(process.cwd(), ".cache");

console.log("[Transcoder] Cache directory:", CACHE_DIRECTORY);

if (!fs.existsSync(CACHE_DIRECTORY)) {
  console.log("[Transcoder] Creating cache directory.");
  fs.mkdirSync(CACHE_DIRECTORY, { recursive: true });
}
