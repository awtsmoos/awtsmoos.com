// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos unites every naming dialect; this contract proves Awtsmoos.com cannot
 * hide a mountain as anonymous detail or treat a living creature as disposable scenery.
 */

import assert from 'node:assert/strict';
import {
	evaluateLodVisibility,
	inferLodClass,
	lodMaximumDistance,
	lodPolicyClasses,
	normalizeLodClass
} from '../../lod/LodPolicy.js';

assert.equal(normalizeLodClass('architecture'), 'building');
assert.equal(normalizeLodClass('mountain'), 'terrain');
assert.equal(normalizeLodClass('creature'), 'actor');
assert.equal(normalizeLodClass('unknown-producer-name'), 'other');
assert.equal(inferLodClass('anything', {
	AwtsmoosLod: { className: 'architecture' }
}), 'building');
assert.equal(inferLodClass('anything', {
	AwtsmoosLod: { className: 'mountain' }
}), 'terrain');
assert.equal(inferLodClass('anything', {
	AwtsmoosLod: { className: 'creature' }
}), 'actor');

assert.equal(inferLodClass('Awtsmoos_visible_player / Cube.002'), 'actor');
assert.equal(inferLodClass('Awtsmoos_flowing_stream_real_water'), 'water');
assert.equal(inferLodClass('Awtsmoos_shul_main_house'), 'landmark');
assert.equal(inferLodClass('Awtsmoos_cottage_roof'), 'building');
assert.equal(inferLodClass('Awtsmoos_forest_merged_leaves'), 'vegetation');
assert.equal(inferLodClass('Awtsmoos_dynamic_yard_grass'), 'grass');
assert.equal(inferLodClass('Awtsmoos_edge_overlay'), 'edge');
assert.equal(inferLodClass('Awtsmoos_lantern_prop'), 'detail');
assert.equal(inferLodClass('mystery'), 'other');
assert.equal(inferLodClass('house-prefix', {
	AwtsmoosYardGrass: { reactsToPlayer: true }
}), 'grass');
assert.equal(inferLodClass('house-prefix', {
	AwtsmoosFence: { posts: 12 }
}), 'edge');

assert.equal(lodMaximumDistance('actor', 'low'), Infinity);
assert.equal(lodMaximumDistance('mountain', 'low'), Infinity);
assert.equal(lodMaximumDistance('creature', 'low'), Infinity);
assert.equal(lodMaximumDistance('grass', 'low'), lodMaximumDistance('grass', 'high'));
assert.equal(lodMaximumDistance('detail', 'medium'), lodMaximumDistance('detail', 'high'));
assert.ok(lodMaximumDistance('grass', 'cinematic') > lodMaximumDistance('grass', 'high'));
assert.ok(lodMaximumDistance('detail', 'cinematic') > lodMaximumDistance('detail', 'high'));

const protectedLandmark = evaluateLodVisibility({
	className: 'landmark',
	distance: 9999,
	tierName: 'low'
});
assert.equal(protectedLandmark.visible, true);
assert.equal(protectedLandmark.reason, 'protected');

const hiddenGrass = evaluateLodVisibility({
	className: 'grass',
	distance: 100,
	tierName: 'low'
});
assert.equal(hiddenGrass.visible, false);
assert.equal(hiddenGrass.reason, 'beyond-distance');

const nearGrass = evaluateLodVisibility({
	className: 'grass',
	distance: 10,
	tierName: 'low'
});
assert.equal(nearGrass.visible, true);
assert.equal(nearGrass.reason, 'within-distance');

const invalidGeometry = evaluateLodVisibility({
	className: 'detail',
	distance: 999,
	tierName: 'low',
	geometryValid: false
});
assert.equal(invalidGeometry.visible, true);
assert.equal(invalidGeometry.protected, true);
assert.equal(invalidGeometry.reason, 'invalid-geometry-protected');

const forcedVisible = evaluateLodVisibility({
	className: 'detail',
	distance: 999,
	tierName: 'low',
	alwaysVisible: true
});
assert.equal(forcedVisible.visible, true);
assert.equal(forcedVisible.protected, true);
assert.ok(lodPolicyClasses().includes('building'));

console.log(JSON.stringify({
	ok: true,
	protectedLandmark,
	hiddenGrass,
	nearGrass,
	invalidGeometry,
	forcedVisible
}, null, 2));
