import fs from "fs";
import path from "path";

const agentDir = path.resolve("geelooy/apps/tunnel/agent");
const manifestPath = path.join(agentDir, "manifest.json");
const version = process.argv[2] || "1.5.48";

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(ent => {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) return walk(full);
    if (!ent.isFile()) return [];
    const rel = path.relative(agentDir, full).replaceAll("\\", "/");
    if (rel === "manifest.json") return [];
    return [rel];
  });
}

const files = walk(agentDir).sort().map(path => ({ path }));

const manifest = {
  BH: 'B"H',
  version,
  entry: "main.js",
  files
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`B"H wrote ${manifestPath}`);
console.log(`version=${version}`);
console.log(`files=${files.length}`);
