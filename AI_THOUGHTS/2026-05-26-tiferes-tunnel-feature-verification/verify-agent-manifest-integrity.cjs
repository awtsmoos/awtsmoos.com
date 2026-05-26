// B"H
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = 'geelooy/apps/tunnel/agent';
const manifestPath = path.join(root, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const results = [];
for (const item of manifest.files || []) {
  const full = path.join(root, item.path);
  if (!fs.existsSync(full)) {
    results.push({ path: item.path, ok: false, error: 'missing_file' });
    continue;
  }
  const bytes = fs.readFileSync(full);
  const actual = {
    bytes: bytes.length,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex')
  };
  results.push({
    path: item.path,
    ok: item.bytes === actual.bytes && item.sha256 === actual.sha256,
    manifest: { bytes: item.bytes, sha256: item.sha256 },
    actual
  });
}

const failed = results.filter(x => !x.ok);
const report = {
  version: manifest.version,
  total: results.length,
  failed: failed.length,
  failedItems: failed.slice(0, 20)
};
console.log(JSON.stringify(report, null, 2));
process.exit(failed.length ? 1 : 0);
