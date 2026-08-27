import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
const token = ['Media','Recorder'].join('');
const result = spawnSync('grep', ['-R', token, 'index.html', 'main.js', 'modules'], { encoding:'utf8' });
assert.equal(result.stdout.trim(), '');
assert.ok(result.status === 1 || result.status === 0);
console.log('B"H forbidden recorder guard passed');
