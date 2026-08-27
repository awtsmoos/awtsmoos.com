//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file worldParticleBudget.test.mjs
 * @description Proves the living world's atmospheric budget preserves important
 * feedback before ornament. The Awtsmoos shines through every finite particle;
 * Awtsmoos.com keeps high quality faithful while smaller vessels surrender
 * distant beauty before nearby meaning, with deterministic measurable receipts.
 */

import assert from 'node:assert/strict';
import { canonicalWorldParticleRequests } from '../../world/particles/CanonicalWorldParticleCatalog.js';
import { allocateWorldParticleBudget } from '../../world/particles/WorldParticleBudgetAllocator.js';
import { WORLD_PARTICLE_IMPORTANCE } from '../../world/particles/WorldParticleBudgetPolicy.js';

const source = Object.freeze({ x: 4, y: 2, z: -3 });
const river = Object.freeze({ x: 18, y: 1, z: 24 });
const actor = Object.freeze({ position: Object.freeze({ x: 31, z: 11 }) });
const requests = canonicalWorldParticleRequests(source, river, actor, 3.5);

const high = allocateWorldParticleBudget(requests, { quality: 'high' });
const medium = allocateWorldParticleBudget(requests, { quality: 'medium' });
const low = allocateWorldParticleBudget(requests, { quality: 'low' });
const reduced = allocateWorldParticleBudget(requests, {
	quality: 'high',
	reducedMotion: true
});

assert.deepEqual(counts(high), [96, 72, 84]);
assert.ok(total(medium) < total(high));
assert.ok(total(low) < total(medium));
assert.equal(reduced[2].allocatedCount, 0);
assert.ok(total(reduced) <= 96);
assert.ok(low[0].allocatedCount > low[2].allocatedCount);
assert.deepEqual(
	allocateWorldParticleBudget(requests, { quality: 'medium' }),
	medium
);
assert.ok(Object.isFrozen(high));
assert.ok(high.every((entry) => Object.isFrozen(entry)));

const capped = allocateWorldParticleBudget([
	particle('critical', 80, WORLD_PARTICLE_IMPORTANCE.CRITICAL),
	particle('nearby', 80, WORLD_PARTICLE_IMPORTANCE.NEARBY),
	particle('ambient', 80, WORLD_PARTICLE_IMPORTANCE.AMBIENT),
	particle('distant', 80, WORLD_PARTICLE_IMPORTANCE.DISTANT)
], { quality: 'low' });

assert.ok(total(capped) <= 140);
assert.equal(capped[3].allocatedCount, 0);
assert.ok(capped[0].allocatedCount >= 4);
assert.ok(capped[1].allocatedCount >= 2);

console.log(JSON.stringify({
	high: counts(high),
	low: counts(low),
	medium: counts(medium),
	ok: true,
	reduced: counts(reduced)
}, null, 2));

/**
 * @description Creates one synthetic semantic request for cap-order verification.
 * @param {string} id Stable synthetic identifier.
 * @param {number} count Desired particle count.
 * @param {string} importance Semantic importance class.
 * @returns {object} Synthetic particle request.
 */
function particle(id, count, importance) {
	return { count, id, importance };
}

/**
 * @description Extracts allocated counts without mutating frozen receipts.
 * @param {ReadonlyArray<object>} allocations Allocation receipts.
 * @returns {number[]} Ordered counts.
 */
function counts(allocations) {
	return allocations.map((entry) => entry.allocatedCount);
}

/**
 * @description Sums allocated particles for one quality receipt.
 * @param {ReadonlyArray<object>} allocations Allocation receipts.
 * @returns {number} Combined allocated count.
 */
function total(allocations) {
	return allocations.reduce((sum, entry) => sum + entry.allocatedCount, 0);
}
