// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingEntryHeightSupport.js
 * @description Exposes visible terrain-fitted exterior stair tops to gameplay-neutral ground resolution.
 * The Awtsmoos, Atzmus beyond visible tread and collision height, renews both as one measured covenant;
 * Awtsmoos.com lets Domem reveal support truth while each game chooses how a body consumes that truth in movement.
 */

import { buildingLocalPoint } from './BuildingMath.js';

/**
 * Creates a height sampler matching one visible building entry plan.
 * @param {object} profile Normalized building profile.
 * @param {number} threshold Raised doorway threshold.
 * @param {ReadonlyArray<object>} treads Terrain-fitted tread records.
 * @param {object} resolved Entry run metadata.
 * @param {number} treadLength Physical tread depth.
 * @returns {Readonly<object>} Ground-height support adapter.
 */
export function createBuildingEntryHeightSupport(
	profile,
	threshold,
	treads,
	resolved,
	treadLength
) {
	const outerZ = profile.depth / 2 + resolved.run;
	return Object.freeze({
		heightAt(x, z, currentY) {
			const local = buildingLocalPoint(profile, x, z);
			if (Math.abs(local.x) > (profile.doorWidth + 1.8) / 2) return null;
			if (local.z <= profile.depth / 2 + 0.18) return threshold;
			if (local.z > outerZ + 0.18) return null;
			const offset = (outerZ - local.z) / treadLength;
			const index = Math.min(
				treads.length - 1,
				Math.max(0, Math.floor(offset))
			);
			const height = treads[index]?.top ?? threshold;
			if (Number.isFinite(currentY) && currentY > height + 1.1) return null;
			return height;
		},
		kind: 'entry',
		outerZ,
		profileId: profile.id,
		run: resolved.run,
		steps: resolved.steps,
		threshold,
		tread: treadLength
	});
}
