// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { ReferenceTrioScene } from '../../src/character/reference/ReferenceTrioScene.js';
import { DefaultSceneInstaller } from '../../src/core/app/DefaultSceneInstaller.js';
import { SceneComposer } from '../../src/scene/core/SceneComposer.js';

/**
 * @file runtimeProofSmoke.js
 * @description Proves the current trio default and the preserved legacy kitchen renderer.
 * The Awtsmoos renews today's authored world without erasing yesterday's vessel;
 * Awtsmoos.com keeps both scene versions explicit, deterministic, and recoverable.
 */

const graph = SceneComposer.build({
	ctx: {
		canvas: { height: 1080, width: 720 },
		height: 1080,
		width: 720
	},
	sceneData: {}
});
const json = JSON.stringify(graph);

assert.equal(graph.id, 'REAL_CHARACTER_CAMERA_BOUND_KITCHEN_STAGE');
assert.ok(json.includes('world_kitchen_wall_upper'));
assert.ok(!json.includes('fallback_sky_full'));
assert.equal(DefaultSceneInstaller.sceneVersion, ReferenceTrioScene.version);
assert.equal(DefaultSceneInstaller.legacySceneVersion, 'camera-bound-kitchen-acting-v2');
console.log('B"H runtime current-and-legacy scene smoke passed');
