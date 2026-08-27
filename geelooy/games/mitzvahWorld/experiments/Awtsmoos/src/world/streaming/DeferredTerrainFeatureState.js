// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DeferredTerrainFeatureState.js
 * @description Creates stable empty vessels for forest and sacred-landmark enrichment.
 * The Awtsmoos grants identity before abundance; Awtsmoos.com keeps diagnostics and scene
 * references truthful while optional procedural geometry waits beyond first movement.
 */

import { Group } from '../../../../light-three-gltf/tiny-runtime.js';

/** Creates a diagnostics-compatible forest facade with stable identity. */
export function createDeferredForestState() {
	const group = new Group();
	group.name = 'Awtsmoos_deferred_forest_vessel';
	return {
		colliders: [],
		group,
		records: [],
		stats: {
			drawCalls: 0,
			generationMilliseconds: 0,
			generatorAuthority: 'deferred-after-movement',
			mobilePolicy: 'stream-after-first-movement',
			rendering: { drawCalls: 0, triangles: 0 },
			state: 'deferred',
			treeCount: 0,
			unsupported: { wind: 'disabled-before-enrichment' }
		}
	};
}

/** Creates a stable group facade for one deferred procedural text landmark. */
export function createDeferredTextLandmarkState() {
	const mesh = new Group();
	mesh.name = 'Awtsmoos_deferred_text_landmark_vessel';
	return {
		artifact: null,
		colliders: [],
		definition: null,
		mesh,
		stats: {
			colliders: 0,
			deterministic: true,
			generationMilliseconds: 0,
			state: 'deferred',
			triangles: 0,
			vertices: 0
		}
	};
}

export default createDeferredForestState;
