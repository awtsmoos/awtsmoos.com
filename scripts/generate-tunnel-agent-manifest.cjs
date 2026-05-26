// B"H
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const agentRoot = path.join(repoRoot, "geelooy/apps/tunnel/agent");
const manifestPath = path.join(agentRoot, "manifest.json");

function bumpPatch(version) {
  const parts = String(version || "1.5.39").split(".").map(x => Number(x));
  while (parts.length < 3) parts.push(0);
  if (parts.some(x => !Number.isFinite(x))) return "1.5.40";
  parts[2] += 1;
  return parts.slice(0, 3).join(".");
}

function walk(dir, prefix = "") {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (entry.name === "manifest.json") return [];
    const full = path.join(dir, entry.name);
    const rel = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) {
      if (rel === "tools/fs/testing" || rel.startsWith("tools/fs/testing/")) return [];
      return walk(full, rel);
    }
    if (!entry.isFile() || !/\.(js|json)$/i.test(entry.name)) return [];
    const data = fs.readFileSync(full);
    return [{
      path: rel,
      bytes: data.length,
      sha256: crypto.createHash("sha256").update(data).digest("hex")
    }];
  });
}

const current = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const manifest = {
  BH: current.BH || "B\"H",
  version: bumpPatch(current.version),
  previousVersion: current.version || null,
  entry: current.entry || "main.js",
  files: walk(agentRoot).sort((a, b) => a.path.localeCompare(b.path))
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log(JSON.stringify({ ok: true, previousVersion: manifest.previousVersion, version: manifest.version, files: manifest.files.length, manifestPath }, null, 2));
