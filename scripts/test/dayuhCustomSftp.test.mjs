// B"H
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const client = readFileSync('scripts/lib/awtsmoosSshClient.mjs', 'utf8');
const session = readFileSync('scripts/lib/dayuhRemoteSession.mjs', 'utf8');
assert.match(client, /Keter-Client\.js/);
assert.match(client, /client\.sftp/);
assert.match(session, /createWriteStream/);
assert.match(session, /createReadStream/);
assert.doesNotMatch(session, /\bscp\b|\brsync\b|spawnSync\(['"]ssh/);
console.log('dayuhCustomSftp.test passed');
