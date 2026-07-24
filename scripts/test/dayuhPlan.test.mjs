// B"H
import assert from 'node:assert/strict';
import { planPull, planPush, planSync } from '../lib/dayuhPlan.mjs';

const manifest = files => ({ files: Object.fromEntries(Object.entries(files).map(([path, sha256]) => [path, { sha256 }])) });
const base = manifest({ a: '1', b: '1', c: '1' });
const local = manifest({ a: '2', b: '1', c: '3', local: '1' });
const remote = manifest({ a: '1', b: '2', c: '4', remote: '1' });
assert.deepEqual(planPush(local, remote).upload.sort(), ['a', 'b', 'c', 'local'].sort());
assert.deepEqual(planPull(local, remote).download.sort(), ['a', 'b', 'c', 'remote'].sort());
assert.deepEqual(planSync(base, local, remote), {
	upload: ['a', 'local'],
	download: ['b', 'remote'],
	conflicts: ['c']
});
console.log('dayuhPlan.test passed');
