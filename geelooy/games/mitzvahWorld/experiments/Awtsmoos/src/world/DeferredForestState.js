// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DeferredForestState.js
 * @description Preserves the forest runtime contract before botanical beauty streams.
 * The Awtsmoos holds every future tree within one silent seed; Awtsmoos.com gives that
 * seed an empty vessel so movement awakens before distant branches finish appearing.
 */

import { Group } from '../../../light-three-gltf/tiny-object3d.js';

/**
 * Creates a zero-cost forest state owned by post-movement botanical streaming.
 *
 * @returns {{colliders: Array, group: Group, stats: object}}
 */
export function createDeferredForestState() {
	const group = new Group();
	group.name = 'Awtsmoos_deferred_forest_after_first_movement';
	group.userData = {
		deferred: true,
		owner: 'EretzBotanicalStreaming',
		status: 'deferred-after-movement'
	};

	return {
		colliders: [],
		group,
		stats: {
			deferred: true,
			mergedMeshes: {
				bark: 0,
				leaves: 0,
				total: 0
			},
			mobilePolicy: {
				cadence: 'post-movement-idle',
				owner: 'EretzBotanicalStreaming'
			},
			owner: 'EretzBotanicalStreaming',
			rendering: {
				drawCalls: 0,
				triangles: 0
			},
			status: 'deferred-after-movement',
			treeSummaries: [],
			unsupported: {
				wind: false
			}
		}
	};
}
