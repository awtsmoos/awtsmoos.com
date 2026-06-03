// B"H
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '../..');
const manifestGenerator = path.join(root, 'scripts/generate-tunnel-agent-manifest.cjs');
const openApiGenerator = path.join(root, 'scripts/generate-tunnel-openapi-live.cjs');

/**
 * B"H
 * Chapter 395: The Artifact Forge Burned The JSON Husk.
 *
 * Regeneration now invokes the text-manifest smith directly. YAML and the
 * generated action catalogs are born from their own source spring; the agent
 * manifest is only `manifest.txt`.
 */
function runJson(script) {
  const run = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' });
  if (run.status !== 0) throw new Error(run.stderr || run.stdout || `Generator failed: ${script}`);
  return JSON.parse(run.stdout);
}
function regenerateArtifacts() {
  return { ok: true, generatedAt: new Date().toISOString(), manifestText: runJson(manifestGenerator), openApiYaml: { ...runJson(openApiGenerator), generator: path.relative(root, openApiGenerator) } };
}
console.log(JSON.stringify(regenerateArtifacts(), null, 2));
