// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldEcologyClearance.test.mjs
 * @description Proves one shared ecology field protects doorway approaches, structures, roads, river, triangles, and steep ground.
 * The Awtsmoos creates dwelling and grove without mixing their finite purpose; Awtsmoos.com verifies every living placement
 * receives signed world truth before root, blossom, stone, or shrub is allowed to manifest beside the canonical way.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	architectureApproachEvidenceAt,
	canonicalArchitectureApproaches
} from '../../world/spatial/WorldArchitectureApproach.js';
import { ecologySiteEvidenceAt } from '../../world/spatial/WorldEcologyClearance.js';
import { triangleExclusionEvidenceAt } from '../../world/spatial/WorldTriangleExclusion.js';
import { CANONICAL_VILLAGE_FOOTPRINTS } from '../../world/village/CanonicalVillageFootprints.js';

const flatGround = {
	heightAt: () => ({ normal: { x: 0, y: 1, z: 0 }, y: 2 })
};

test('canonical house approach rectangles protect the real facade axis', () => {
	const approach = canonicalArchitectureApproaches()[0];
	const evidence = architectureApproachEvidenceAt({ x: approach.x, z: approach.z });
	assert.equal(evidence.sourceId, approach.sourceId);
	assert.equal(evidence.inside, true);
	assert.ok(evidence.clearance < 0);
	const ecology = ecologySiteEvidenceAt({ x: approach.x, z: approach.z }, {
		groundSampler: flatGround,
		siteRadius: 0.5
	});
	assert.equal(ecology.valid, false);
	assert.ok(ecology.approach < 0);
});

test('canonical footprint centers remain forbidden to all ecology', () => {
	const footprint = CANONICAL_VILLAGE_FOOTPRINTS[0];
	const ecology = ecologySiteEvidenceAt({ x: footprint.x, z: footprint.z }, {
		groundSampler: flatGround,
		siteRadius: 0.4
	});
	assert.equal(ecology.valid, false);
	assert.ok(ecology.footprint < 0);
});

test('dynamic collider triangles use exact signed edge clearance', () => {
	const triangle = {
		a: { x: 140, z: 140 },
		b: { x: 146, z: 140 },
		c: { x: 140, z: 146 },
		kind: 'future-prop'
	};
	const inside = triangleExclusionEvidenceAt({ x: 141, z: 141 }, [triangle], { margin: 0.5 });
	const outside = triangleExclusionEvidenceAt({ x: 153, z: 153 }, [triangle], { margin: 0.5 });
	assert.equal(inside.inside, true);
	assert.ok(inside.clearance < 0);
	assert.equal(outside.inside, false);
	assert.ok(outside.clearance > 0);
});

test('steep terrain is rejected even when horizontal site is otherwise open', () => {
	const steepGround = {
		heightAt: () => ({ normal: { x: 0.8, y: 0.42, z: 0.2 }, y: 9 })
	};
	const ecology = findSite(steepGround, evidence => evidence.slope < 0);
	assert.ok(ecology);
	assert.equal(ecology.valid, false);
});

test('shared ecology field still leaves valid open ground for nature', () => {
	const ecology = findSite(flatGround, evidence => evidence.valid);
	assert.ok(ecology);
	assert.equal(ecology.valid, true);
	assert.equal(ecology.sample.y, 2);
});

function findSite(groundSampler, predicate) {
	for (let x = -220; x <= 220; x += 20) {
		for (let z = -220; z <= 220; z += 20) {
			const evidence = ecologySiteEvidenceAt({ x, z }, { groundSampler, siteRadius: 0.4 });
			if (predicate(evidence)) return evidence;
		}
	}
	return null;
}
