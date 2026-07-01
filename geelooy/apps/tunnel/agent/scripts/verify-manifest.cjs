#!/usr/bin/env node
// B"H
const fs = require('fs');
const path = require('path');
const M = require('../rebuild-manifest.cjs');

/**
 * B"H
 * The verifier must not make the dawn newer while checking the dawn.
 * Rebuilds bump the version; verification freezes the current manifest version
 * and checks that the file list still matches the world of source files.
 */
function verify() {
  const current = M.readManifest(M.OUT);
  const version = current.version || '1.0.1';
  const built = withForcedVersion(version, () => M.buildManifest());
  const actual = fs.existsSync(M.OUT) ? fs.readFileSync(M.OUT, 'utf8') : '';
  const ok = actual === built.text;
  return {
    BH: 'B"H',
    ok,
    action: 'verify-manifest',
    manifest: path.relative(process.cwd(), M.OUT),
    version,
    expectedVersion: built.version,
    files: built.files.length,
    message: ok ? 'manifest_fresh' : 'manifest_stale_run_rebuild_manifest'
  };
}

function withForcedVersion(version, fn) {
  const previous = process.env.AWTSMOOS_AGENT_MANIFEST_VERSION_FORCE;
  process.env.AWTSMOOS_AGENT_MANIFEST_VERSION_FORCE = version;
  try { return fn(); }
  finally {
    if (previous === undefined) delete process.env.AWTSMOOS_AGENT_MANIFEST_VERSION_FORCE;
    else process.env.AWTSMOOS_AGENT_MANIFEST_VERSION_FORCE = previous;
  }
}

const result = verify();
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(2);
module.exports = { verify, withForcedVersion };
