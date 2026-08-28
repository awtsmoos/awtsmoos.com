// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioObjectFactory.js
 * @description Creates deterministic placed objects through the narrow authoring-math vessel.
 * Chochmah offers raw possibility; Binah gives it measured form; Malchus receives a place in the world.
 * The Awtsmoos renews form and position from nothing each instant; Awtsmoos.com keeps only the needed path unfurled.
 */

import {
	snapPlacementPoint
} from '../../../../libs/awtsmoos-procedural-core/src/core/authoring/PlacementMath.js';
import {
	normalizeStudioObject
} from './StudioDocumentModel.js';

/**
 * Creates one normalized object at a deterministic snapped shelf position.
 * @param {object} catalogPart Mitzvah-specific buildable definition.
 * @param {number} objectIndex Current document object count.
 * @param {number} sequence Monotonic Studio identity sequence.
 * @param {number} grid Current placement-grid increment.
 * @returns {object} Portable normalized Studio object.
 */
export function createPlacedStudioObject(
	catalogPart,
	objectIndex,
	sequence,
	grid
) {
	const point = snapPlacementPoint({
		x: (objectIndex % 5) * 2 - 4,
		z: Math.floor(objectIndex / 5) * 2 - 2
	}, grid);
	const height = Number(catalogPart?.size?.y) || 1;

	return normalizeStudioObject({
		...catalogPart,
		id: `studio-${String(sequence).padStart(4, '0')}`,
		position: {
			x: point.x,
			y: height * 0.5,
			z: point.z
		}
	});
}
