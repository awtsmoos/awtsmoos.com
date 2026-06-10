// B"H
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const tunnelDir = path.resolve(scriptDir, "..");
const agentDir = path.join(tunnelDir, "agent");
const manifestPath = path.join(agentDir, "manifest.txt");

/**
 * B"H
 * Chapter 396: The Installer Scroll Refused The Deprecated Shadow.
 *
 * The manifest is text only: blessing, version, entry, and downloadable files.
 * The stale JSON name is not mentioned because it is no longer a vessel.
 */
function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    const rel = path.relative(agentDir, full).replaceAll("\\", "/");
    if (ent.isDirectory()) {
      if (rel.includes("/testing/") || rel === "tools/fs/testing") continue;
      out.push(...walk(full));
      continue;
    }
    if (!ent.isFile()) continue;
    if (rel === "manifest.txt" || rel.includes("/.tmp-") || rel.endsWith(".test.cjs") || rel.endsWith(".test.js") || rel.endsWith(".map")) continue;
    out.push(rel);
  }
  return out;
}
function oldVersion() {
  try {
    const lines = fs.readFileSync(manifestPath, "utf8").split(/\r?\n/).map(v => v.trim()).filter(Boolean);
    return lines[1] || "1.0.0";
  } catch (_e) { return "1.0.0"; }
}
function bump(version) {
  const parts = String(version || "1.0.0").split(".").map(v => parseInt(v, 10) || 0);
  while (parts.length < 3) parts.push(0);
  parts[2] += 1;
  return parts.join(".");
}
const version = bump(oldVersion());
const publicFiles = [
  "apps/ai/relay/split-browser/controlPage.cjs",
  "apps/ai/relay/split-browser/proxy.cjs",
  "apps/ai/relay/split-browser/cookieJar.cjs",
  "apps/ai/relay/split-browser/authState.cjs",
  "apps/ai/relay/split-browser/clientState.cjs"
];

const files = [...walk(agentDir), ...publicFiles].sort();


fs.writeFileSync(manifestPath, ['B"H', version, "main.js", "", ...files, ""].join("\n"), "utf8");
console.log(`B"H wrote manifest`);
console.log(`manifest ${manifestPath}`);
console.log(`version ${version}`);
console.log(`files ${files.length}`);
