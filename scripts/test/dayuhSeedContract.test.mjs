// B"H
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const archive = readFileSync('scripts/lib/dayuhRawArchive.mjs', 'utf8');
const remote = readFileSync('scripts/lib/dayuhRemoteSeed.mjs', 'utf8');
assert.match(archive, /\['-czf'/);
assert.match(archive, /createHash\('sha256'\)/);
assert.match(archive, /session\.input/);
assert.match(archive, /session\.completion/);
assert.match(remote, /openAwtsmoosExecInput/);
assert.match(remote, /seed\.tar\.gz\.part/);
assert.match(remote, /sha256sum/);
assert.match(remote, /tar -xzf/);
assert.match(remote, /incoming-seed/);
assert.match(remote, /previous-seed/);
assert.doesNotMatch(remote, /\bscp\b|\brsync\b/);
console.log('dayuhSeedContract.test passed');
