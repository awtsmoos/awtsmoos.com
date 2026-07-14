// B"H
// Boruch Hashem
// Blessed is He
/** @module ReleaseTrainTest @description Verifies chapters one through five. */
import assert from 'node:assert/strict';
import {
	assertNoDrift,
	classifyArtifact,
	createEvidenceManifest,
	createOwnershipClaim,
	createReleaseTrain,
	detectDrift,
	findOwnershipConflicts
} from '../release/index.mjs';

const train = createReleaseTrain({
	id: 'social',
	name: 'Social',
	chapters: [5, 1, 1],
	owners: ['agent-a']
});
assert.deepEqual(train.chapters, [1, 5]);
assert.equal(Object.isFrozen(train), true);
assert.equal(classifyArtifact('tests/unit.test.mjs'), 'test');
assert.equal(classifyArtifact('evidence/screenshot.png'), 'evidence');
assert.equal(classifyArtifact('dist/app.js'), 'build-output');
const now = Date.parse('2026-01-01T00:00:00Z');
const first = createOwnershipClaim({ path: 'a.js', owner: 'a', leaseMs: 1000 }, now);
const second = createOwnershipClaim({ path: 'a.js', owner: 'b', leaseMs: 1000 }, now);
assert.equal(findOwnershipConflicts([first, second], now).length, 2);
assert.equal(detectDrift({ a: '1' }, { a: '2' }).clean, false);
assert.throws(() => assertNoDrift({ a: '1' }, { a: '2' }));
const evidence = createEvidenceManifest({ trainId: 'social', head: 'abc', tests: ['ok'] });
assert.equal(Object.isFrozen(evidence.tests), true);
console.log('B"H release train passed.');
