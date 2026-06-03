// B"H
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const agentRoot = path.join(repoRoot, "geelooy/apps/tunnel/agent");
const manifestPath = path.join(agentRoot, "manifest.txt");
const ENTRY = "main.js";

/**
 * B"H
 * Chapter 394: The Agent Manifest Returned To Plain Breath.
 *
 * The Awtsmoos installer reads a simple text scroll: blessing, version, entry,
 * then the files. No deprecated JSON vessel is generated, referenced, or shipped.
 */
function readOldVersion() {
  try {
    const lines = fs.readFileSync(manifestPath, "utf8").split(/\r?\n/).map(x => x.trim()).filter(Boolean);
    return lines[1] || "1.0.0";
  } catch (_e) { return "1.0.0"; }
}
function bump(version) {
  const parts = String(version || "1.0.0").split(".").map(x => Number(x) || 0);
  while (parts.length < 3) parts.push(0);
  parts[2] += 1;
  return parts.slice(0, 3).join(".");
}
function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    const rel = path.relative(agentRoot, full).replace(/\\/g, "/");
    if (ent.isDirectory()) {
      if (rel === "tools/fs/testing" || rel.startsWith("tools/fs/testing/")) continue;
      walk(full, out);
      continue;
    }
    if (!ent.isFile()) continue;
    if (rel === "manifest.txt" || rel.endsWith(".test.js") || rel.endsWith(".test.cjs") || rel.endsWith(".map") || rel.includes("/.tmp-")) continue;
    if (/\.(js|json|mjs|cjs)$/i.test(ent.name)) out.push(rel);
  }
  return out;
}
function writeManifest() {
  const oldVersion = readOldVersion();
  const version = bump(oldVersion);
  const files = walk(agentRoot).sort((a, b) => a.localeCompare(b));
  const text = ['B"H', version, ENTRY, "", ...files, ""].join("\n");
  fs.writeFileSync(manifestPath, text, "utf8");
  return { ok: true, path: path.relative(repoRoot, manifestPath), previousVersion: oldVersion, version, entry: ENTRY, files: files.length };
}
console.log(JSON.stringify(writeManifest(), null, 2));
