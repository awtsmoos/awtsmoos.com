// B"H
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const tunnelDir = path.resolve(scriptDir, "..");
const agentDir = path.join(tunnelDir, "agent");
const manifestPath = path.join(agentDir, "manifest.txt");

function walk(dir) {
  const out = [];

  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);

    if (ent.isDirectory()) {
      out.push(...walk(full));
      continue;
    }

    if (!ent.isFile()) continue;

    const rel = path.relative(agentDir, full).replaceAll("\\", "/");

    if (
      rel === "manifest.txt" ||
      rel.includes("/testing/") ||
      rel.includes("/.tmp-") ||
      rel.endsWith(".test.cjs") ||
      rel.endsWith(".test.js") ||
      rel.endsWith(".map")
    ) continue;

    out.push(rel);
  }

  return out;
}

function bump(version) {
  const parts = String(version || "1.0.0")
    .trim()
    .split(".")
    .map(v => parseInt(v, 10) || 0);

  while (parts.length < 3) parts.push(0);

  parts[2] += 1;

  return parts.join(".");
}

let oldVersion = "1.0.0";

if (fs.existsSync(manifestPath)) {
  const first = fs.readFileSync(manifestPath, "utf8")
    .split(/\r?\n/)
    .map(v => v.trim())
    .filter(Boolean);

  if (first[1]) oldVersion = first[1];
}

const nextVersion = bump(oldVersion);
const entry = "main.js";

const files = walk(agentDir).sort();

const text = [
  'B"H',
  nextVersion,
  entry,
  "",
  ...files,
  ""
].join("\n");

fs.writeFileSync(manifestPath, text, "utf8");

console.log(`B"H wrote manifest`);
console.log(`agentDir ${agentDir}`);
console.log(`manifest ${manifestPath}`);
console.log(`version ${oldVersion} -> ${nextVersion}`);
console.log(`files ${files.length}`);
