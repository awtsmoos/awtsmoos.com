// B"H
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '../..');
const agentDir = path.join(root, 'geelooy/apps/tunnel/agent');
const manifestPath = path.join(agentDir, 'manifest.json');
const openApiGenerator = path.join(root, 'scripts/generate-tunnel-openapi-live.cjs');

/**
 * B"H
 * Chapter 361: The Artifact Forge Stopped Copying Shadows.
 *
 * Regeneration must strike the source-spring, not smear yesterday's parchment
 * over tomorrow's gate. This forge rebuilds the agent manifest from disk, then
 * invokes the OpenAPI generator so every YAML scroll is born from the live
 * tunnel action registry and its AI-agent parameters.
 */
function sha256(buffer) { return crypto.createHash('sha256').update(buffer).digest('hex'); }
function bumpPatch(version) {
  const parts = String(version || '1.5.39').split('.').map(Number);
  while (parts.length < 3) parts.push(0);
  if (parts.some(x => !Number.isFinite(x))) return '1.5.40';
  parts[2] += 1;
  return parts.slice(0, 3).join('.');
}
function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = path.relative(agentDir, full).replace(/\\/g, '/');
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (rel === 'tools/fs/testing' || rel.startsWith('tools/fs/testing/')) continue;
      walk(full, out);
    } else if (rel !== 'manifest.json' && /\.(js|json)$/i.test(name)) out.push(rel);
  }
  return out;
}
function readExistingManifest() {
  try { return JSON.parse(fs.readFileSync(manifestPath, 'utf8')); }
  catch { return {}; }
}
function regenerateManifest() {
  const previous = readExistingManifest();
  const files = walk(agentDir).sort().map(rel => {
    const buffer = fs.readFileSync(path.join(agentDir, rel));
    return { path: rel, bytes: buffer.length, sha256: sha256(buffer) };
  });
  const next = { BH: previous.BH || 'B"H', version: bumpPatch(previous.version), entry: previous.entry || 'main.js', files };
  fs.writeFileSync(manifestPath, JSON.stringify(next, null, 2) + '\n', 'utf8');
  return { path: path.relative(root, manifestPath), files: files.length, previousVersion: previous.version || null, version: next.version };
}
function regenerateOpenApiYaml() {
  const run = spawnSync(process.execPath, [openApiGenerator], { cwd: root, encoding: 'utf8' });
  if (run.status !== 0) throw new Error(run.stderr || run.stdout || 'OpenAPI generator failed');
  const parsed = JSON.parse(run.stdout);
  return { ...parsed, generator: path.relative(root, openApiGenerator) };
}
const result = { ok: true, generatedAt: new Date().toISOString(), manifest: regenerateManifest(), openApiYaml: regenerateOpenApiYaml() };
console.log(JSON.stringify(result, null, 2));
