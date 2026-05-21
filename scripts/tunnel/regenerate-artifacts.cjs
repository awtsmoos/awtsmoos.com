// B"H
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '../..');
const agentDir = path.join(root, 'geelooy/apps/tunnel/agent');
const manifestPath = path.join(agentDir, 'manifest.json');
const yamlPath = path.join(root, 'geelooy/apps/tunnel-control/gpt/awtsmoos-action-openapi.yaml');
const generatedYamlPath = path.join(root, 'geelooy/apps/tunnel-control/gpt/awtsmoos-action-openapi.generated-live.yaml');

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = path.relative(agentDir, full).replace(/\\/g, '/');
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (rel === 'tools/fs/testing' || rel.startsWith('tools/fs/testing/')) continue;
      walk(full, out);
    } else {
      if (rel === 'manifest.json') continue;
      out.push(rel);
    }
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
    const buf = fs.readFileSync(path.join(agentDir, rel));
    return { path: rel, bytes: buf.length, sha256: sha256(buf) };
  });
  const next = {
    BH: previous.BH || 'B"H',
    version: previous.version || '1.5.39',
    entry: previous.entry || 'main.js',
    files
  };
  fs.writeFileSync(manifestPath, JSON.stringify(next, null, 2) + '\n');
  return { path: path.relative(root, manifestPath), files: files.length, version: next.version };
}

function regenerateOpenApiYaml() {
  const source = fs.readFileSync(yamlPath, 'utf8');
  fs.writeFileSync(generatedYamlPath, source);
  return {
    source: path.relative(root, yamlPath),
    generated: path.relative(root, generatedYamlPath),
    bytes: Buffer.byteLength(source, 'utf8'),
    sha256: sha256(Buffer.from(source, 'utf8'))
  };
}

const result = {
  ok: true,
  generatedAt: new Date().toISOString(),
  manifest: regenerateManifest(),
  openApiYaml: regenerateOpenApiYaml()
};
console.log(JSON.stringify(result, null, 2));
