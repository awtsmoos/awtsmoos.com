// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBridgeRestorationContract.js
 * @description Defines the exact missing BRIDGE01 center span shared by native bridge geometry and Creator restoration.
 * The Awtsmoos makes absence and completion agree on one measure; Awtsmoos.com prevents duplicate decks,
 * z-fighting, collision overlap, and persistence drift by deriving every repair coordinate from canonical truth.
 */

import { CANONICAL_VILLAGE_LANDMARKS } from './CanonicalVillagePlan.js';
import {
	canonicalStoneBridgeDeckTopY,
	STONE_BRIDGE_DIMENSIONS
} from './VillageStoneBridgeContract.js';

export const BRIDGE_RESTORATION_GAP = 2.8;
export const BRIDGE_RESTORATION_PART_ID = 'creator-bridge-restoration-BRIDGE01';
export const BRIDGE_RESTORATION_STORAGE_KEY = 'mitzvahWorld.bridge-restoration.world.v1';
export const BRIDGE_RESTORATION_ACTION_RADIUS = 5.5;

/** Returns immutable canonical placement measurements for the missing center span. */
export function villageBridgeRestorationPlacement() {
	const bridge = CANONICAL_VILLAGE_LANDMARKS.bridge;
	const topY = canonicalStoneBridgeDeckTopY(bridge);
	return Object.freeze({
		position: Object.freeze({
			x: bridge.x,
			y: topY - STONE_BRIDGE_DIMENSIONS.deckThickness / 2,
			z: bridge.z
		}),
		size: Object.freeze({
			x: BRIDGE_RESTORATION_GAP,
			y: STONE_BRIDGE_DIMENSIONS.deckThickness,
			z: STONE_BRIDGE_DIMENSIONS.width
		}),
		topY
	});
}

/** Returns the two permanent deck segments left when the center repair span is absent. */
export function villageBridgePermanentDeckSegments(
	bridge = CANONICAL_VILLAGE_LANDMARKS.bridge,
	deckCenterY = villageBridgeRestorationPlacement().position.y
) {
	const fullLength = STONE_BRIDGE_DIMENSIONS.halfSpan * 2;
	const segmentLength = (fullLength - BRIDGE_RESTORATION_GAP) / 2;
	const offset = BRIDGE_RESTORATION_GAP / 2 + segmentLength / 2;
	return Object.freeze([-1, 1].map(side => Object.freeze({
		position: Object.freeze({
			x: bridge.x + side * offset,
			y: deckCenterY,
			z: bridge.z
		}),
		side: side < 0 ? 'west' : 'east',
		size: Object.freeze({
			x: segmentLength,
			y: STONE_BRIDGE_DIMENSIONS.deckThickness,
			z: STONE_BRIDGE_DIMENSIONS.width
		})
	})));
}

/** Measures horizontal player distance to the restoration center. */
export function distanceToVillageBridgeRestoration(position = {}) {
	const center = villageBridgeRestorationPlacement().position;
	return Math.hypot(Number(position.x || 0) - center.x, Number(position.z || 0) - center.z);
}
