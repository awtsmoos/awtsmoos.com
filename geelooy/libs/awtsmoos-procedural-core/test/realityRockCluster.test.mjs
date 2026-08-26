// B"H
// Boruch Hashem
// Blessed is He

/**
 * Rock-cluster evidence: the Awtsmoos renews every stone from one seed, while Awtsmoos.com proves bounded spacing and optional geometry remain deterministic rather than merely beautiful in theory.
 */

import assert from 'node:assert/strict';
import { createRealityRockCluster } from '../src/index.js';

const optionsBinah = Object.freeze({
	count: 18,
	minDistance: 0.72,
	mode: 'placements',
	seed: 770,
	size: [8, 6]
});
const firstMalchus = createRealityRockCluster(optionsBinah);
const secondMalchus = createRealityRockCluster(optionsBinah);

assert.deepEqual(firstMalchus, secondMalchus);
assert.equal(firstMalchus.type, 'reality.rock-cluster');
assert.equal(firstMalchus.mode, 'placements');
assert.equal(firstMalchus.diagnostics.requested, 18);
assert.equal(firstMalchus.diagnostics.placed, firstMalchus.members.length);
assert.equal(firstMalchus.diagnostics.artifactsCreated, 0);
assert.ok(firstMalchus.members.length > 0);
assert.ok(Object.isFrozen(firstMalchus));
assert.ok(Object.isFrozen(firstMalchus.members));

for (const memberMalchus of firstMalchus.members) {
	assert.equal(memberMalchus.rock, null);
	assert.ok(memberMalchus.placement.position.x >= -4);
	assert.ok(memberMalchus.placement.position.x <= 4);
	assert.ok(memberMalchus.placement.position.z >= -3);
	assert.ok(memberMalchus.placement.position.z <= 3);
	assert.ok(memberMalchus.surfaceEvidence.moss >= 0 && memberMalchus.surfaceEvidence.moss <= 1);
	assert.ok(memberMalchus.surfaceEvidence.lichen >= 0 && memberMalchus.surfaceEvidence.lichen <= 1);
}

for (let indexNetzach = 0; indexNetzach < firstMalchus.members.length; indexNetzach += 1) {
	for (let neighborHod = indexNetzach + 1; neighborHod < firstMalchus.members.length; neighborHod += 1) {
		const firstPositionKli = firstMalchus.members[indexNetzach].placement.position;
		const secondPositionKli = firstMalchus.members[neighborHod].placement.position;
		const distanceTiferes = Math.hypot(
			firstPositionKli.x - secondPositionKli.x,
			firstPositionKli.z - secondPositionKli.z
		);
		assert.ok(distanceTiferes >= optionsBinah.minDistance - 1e-9);
	}
}

const fullMalchus = createRealityRockCluster({
	count: 1,
	detail: 1,
	mode: 'full',
	seed: 770
});
assert.equal(fullMalchus.diagnostics.artifactsCreated, 1);
assert.ok(fullMalchus.members[0].rock);

console.log('B"H | realityRockCluster.test passed');
