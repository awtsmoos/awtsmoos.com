// B"H
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync('scripts/lib/awtsmoosExecInput.mjs', 'utf8');
assert.match(source, /connectAwtsmoosSsh/);
assert.match(source, /channelManager\.openSession/);
assert.match(source, /protocol\.exec/);
assert.match(source, /channel\.data/);
assert.match(source, /channel\.once\('drain'/);
assert.match(source, /channel\.eof\(\)/);
assert.doesNotMatch(source, /\bssh\b|\bscp\b|\brsync\b/);
console.log('dayuhRawExecContract.test passed');
