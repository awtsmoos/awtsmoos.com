// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file visualQualityDiagnostics.test.mjs
 * @description Proves the joined visual receipt for player, sky, renderer, terrain, projection, and frame health.
 * The Awtsmoos binds sky, earth, camera, and Chossid without confusing witness with command;
 * Awtsmoos.com reads their visible truth on demand while gameplay remains untouched by the measuring hand.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	captureVisualQualityDiagnostics,
	VISUAL_QUALITY_DIAGNOSTICS_VERSION
} from '../../app/VisualQualityDiagnostics.js';

/** Proves the complete receipt stays serializable and observes rather than mutates runtime state. */
test('visual quality receipt joins canonical player and scene evidence', () => {
	const runtimeMalchus = fixture();
	const beforeGevurah = runtimeMalchus.model.position.x;
	const receiptHod = captureVisualQualityDiagnostics(runtimeMalchus);
	assert.equal(receiptHod.version, VISUAL_QUALITY_DIAGNOSTICS_VERSION);
	assert.equal(receiptHod.player.canonical.status, 'ready');
	assert.deepEqual(receiptHod.player.animation, { clip: 'stand_Armature' });
	assert.equal(receiptHod.player.meshes, 2);
	assert.equal(receiptHod.player.skinned, 1);
	assert.equal(receiptHod.player.projection.inView, true);
	assert.equal(receiptHod.sky.source, 'local-procedural-webgl');
	assert.equal(receiptHod.renderer.hasDelegate, true);
	assert.equal(receiptHod.renderer.triangles, 3456);
	assert.equal(receiptHod.terrain.materialReady, true);
	assert.equal(receiptHod.error.message, 'proof frame error');
	assert.equal(runtimeMalchus.model.position.x, beforeGevurah);
});

/** Proves pre-hydration shapes fail soft instead of making diagnostics a gameplay dependency. */
test('visual quality receipt tolerates an empty bootstrap-shaped runtime', () => {
	const receiptHod = captureVisualQualityDiagnostics({});
	assert.equal(receiptHod.player, null);
	assert.equal(receiptHod.camera, null);
	assert.equal(receiptHod.renderer, null);
	assert.equal(receiptHod.terrain, null);
});

/** Creates one stable runtime vessel containing every visual witness exercised by the receipt. */
function fixture() {
	const positionYesod = vector(0.2, 0.5, -1);
	return {
		camera: {
			aspect: 0.45,
			fov: 55,
			position: vector(0, 4, 8)
		},
		lastFrameError: new Error('proof frame error'),
		model: {
			name: 'Awtsmoos_canonical_player',
			position: positionYesod,
			traverse(visitorChesed) {
				visitorChesed({ isMesh: true, isSkinnedMesh: false, visible: true });
				visitorChesed({ isMesh: true, isSkinnedMesh: true, visible: true });
			},
			userData: {
				AwtsmoosCanonicalPlayer: { status: 'ready' }
			},
			visible: true
		},
		player: {
			diagnostics: () => ({ clip: 'stand_Armature' })
		},
		renderer: {
			backend: 'webgl',
			delegate: new ProofDelegate(),
			domElement: { height: 2745, width: 1236 },
			hydrationState: 'ready',
			stats: {
				draws: 22,
				frames: 40,
				meshes: 18,
				triangles: 3456
			}
		},
		scene: {
			traverse(visitorChesed) {
				visitorChesed({
					userData: {
						AwtsmoosSky: { source: 'local-procedural-webgl' }
					}
				});
			}
		},
		terrain: {
			materialDiagnostics: () => ({ materialReady: true })
		}
	};
}

/** Names the renderer delegate so the public receipt can prove delegation without exposing implementation. */
class ProofDelegate {}

/** Creates the tiny vector surface needed for position and projection evidence. */
function vector(x, y, z) {
	return {
		clone() {
			return {
				project() {},
				x,
				y,
				z
			};
		},
		x,
		y,
		z
	};
}
