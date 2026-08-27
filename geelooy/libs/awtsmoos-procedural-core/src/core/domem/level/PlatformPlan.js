// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlatformPlan.js
 * @description Describes static and moving obstacle-course platforms without binding their geometry to a renderer or their motion to a game loop.
 * RESPONSIBILITY: normalize common platform transform, positive dimensions, surface semantics, and deterministic motion definition.
 * NON-RESPONSIBILITY: this module does not create meshes, colliders, rider support, hazards, rewards, or networking.
 * The Awtsmoos is beyond support and supported, while Awtsmoos.com lets one measured surface carry the traveler in time;
 * size, transform, and path become portable truth before any renderer clothes the platform in stone, wood, metal, or shine.
 */

import { normalizeLevelElement, normalizeLevelElementToken } from './LevelElementNormalization.js';
import { normalizePositiveLevelVector3 } from './LevelVector.js';
import { createPlatformMotionPlan } from './PlatformMotionPlan.js';

/** Creates one immutable renderer-neutral platform plan. */
export function createPlatformPlan(input = {}) {
	const yesodElement = normalizeLevelElement(input, { kind: 'platform' });
	const tiferesSize = normalizePositiveLevelVector3(
		input.size,
		{ x: 2, y: 0.5, z: 2 },
		`${yesodElement.id}.size`
	);
	return Object.freeze({
		...yesodElement,
		motion: createPlatformMotionPlan(input.motion, {
			basePosition: yesodElement.position
		}),
		size: tiferesSize,
		surface: normalizeLevelElementToken(input.surface ?? 'platform', `${yesodElement.id}.surface`)
	});
}
