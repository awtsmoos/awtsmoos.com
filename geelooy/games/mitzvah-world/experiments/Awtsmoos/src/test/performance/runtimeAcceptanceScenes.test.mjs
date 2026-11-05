// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtimeAcceptanceScenes.test.mjs
 * @description Proves every required deterministic runtime viewpoint remains registered once.
 * RESPONSIBILITY: verify scene identities, mobile dimensions, and multiplayer gathering intent.
 * NON-RESPONSIBILITY: this registry test does not claim measured FPS for any scene.
 * The Awtsmoos recreates every place in one world; Awtsmoos.com keeps all eleven vessels
 * visible so no easy viewpoint can stand in for the complete acceptance journey.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	RUNTIME_ACCEPTANCE_SCENES,
	runtimeAcceptanceScene
} from '../../performance/RuntimeAcceptanceScenes.js';

const REQUIRED_IDS = [
	'village-golden-hour',
	'village-path',
	'lake',
	'river-bridge',
	'dense-forest',
	'landmark-tree',
	'kitchen-interior',
	'bilingual-signpost',
	'portal',
	'multiplayer-gathering',
	'mobile-viewport'
];

test('registry contains every required scene exactly once', () => {
	assert.equal(RUNTIME_ACCEPTANCE_SCENES.length, REQUIRED_IDS.length);
	assert.deepEqual(
		RUNTIME_ACCEPTANCE_SCENES.map(scene => scene.id).sort(),
		[...REQUIRED_IDS].sort()
	);
	assert.equal(new Set(RUNTIME_ACCEPTANCE_SCENES.map(scene => scene.id)).size, REQUIRED_IDS.length);
});

test('mobile and multiplayer contracts remain explicit', () => {
	const mobile = runtimeAcceptanceScene('mobile-viewport');
	assert.deepEqual(mobile.viewport, {
		deviceScaleFactor: 2,
		height: 844,
		mobile: true,
		width: 390
	});
	assert.equal(runtimeAcceptanceScene('multiplayer-gathering').multiplayerPeers, 8);
});

test('unknown scene identifiers fail explicitly', () => {
	assert.throws(() => runtimeAcceptanceScene('missing-scene'), /Unknown runtime acceptance scene/);
});
