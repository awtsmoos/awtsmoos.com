//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file DeferredTerrainFeatureState.js
 * @description Creates stable empty vessels for forest and sacred-landmark enrichment before post-movement hydration.
 * Identity exists immediately while optional procedural geometry remains deferred and native hierarchy allocation stays in Core.
 */

import { createNativeWorldGroup } from '../../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';

/**
 * Creates a diagnostics-compatible forest facade with stable identity and zero early rendering cost.
 * @returns {object} Deferred forest state consumed by streaming/hydration code.
 */
export function createDeferredForestState() {
	const group = createNativeWorldGroup({
		name: 'Awtsmoos_deferred_forest_vessel'
	});
	return {
		colliders: [],
		group,
		records: [],
		stats: {
			drawCalls: 0,
			generationMilliseconds: 0,
			generatorAuthority: 'deferred-after-movement',
			mobilePolicy: 'stream-after-first-movement',
			rendering: {
				drawCalls: 0,
				triangles: 0
			},
			state: 'deferred',
			treeCount: 0,
			unsupported: {
				wind: 'disabled-before-enrichment'
			}
		}
	};
}

/**
 * Creates a stable group facade for one deferred procedural text landmark.
 * @returns {object} Deferred text-landmark state consumed by hydration code.
 */
export function createDeferredTextLandmarkState() {
	const mesh = createNativeWorldGroup({
		name: 'Awtsmoos_deferred_text_landmark_vessel'
	});
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
