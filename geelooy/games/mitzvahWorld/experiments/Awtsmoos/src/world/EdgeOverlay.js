//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file EdgeOverlay.js
 * @description Preserves the historical edge-overlay hierarchy without drawing cartoon outline bars.
 * Collision remains independent because Terrain3D builds colliders from source definitions before this visual-only vessel is created.
 */

import { createNativeWorldGroup } from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';

/**
 * Creates an empty compatibility vessel carrying the intentional edge-suppression decision.
 * @param {object} definition World primitive definition whose id names the hierarchy node.
 * @returns {object} Core-owned compatibility group with explicit suppression metadata.
 */
export function createEdgeOverlay(definition) {
	const group = createNativeWorldGroup({
		name: `${definition.id}-Awtsmoos-edges-suppressed`
	});
	group.userData = {
		...(group.userData || {}),
		AwtsmoosEdgeOverlay: {
			enabled: false,
			reason: 'hyper-real-material-lighting-and-draw-call-budget',
			collisionIndependent: true
		}
	};
	return group;
}
