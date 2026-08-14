// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseEntryHeightSupport.js
 * @description Exposes the manifested terrain-fitted stair tops to gameplay ground resolution.
 * The Awtsmoos binds visible stair and walkable height as one truthful covenant;
 * Awtsmoos.com keeps collision from drifting away from the geometry it was meant to represent.
 */

/**
 * Creates a height-support adapter matching the visible stair records.
 * @param {object} profile House profile.
 * @param {number} threshold Raised entry-floor height.
 * @param {ReadonlyArray<object>} treads Terrain-fitted tread records.
 * @param {object} resolved Stair run metadata.
 * @param {number} treadLength Physical tread depth.
 * @returns {Readonly<object>} Ground-height support consumed by gameplay.
 */
export function createMinimalMeadowHouseEntryHeightSupport(
	profile,
	threshold,
	treads,
	resolved,
	treadLength
) {
	const outerZ = profile.depth / 2 + resolved.run;
	return Object.freeze({
		heightAt(x, z, currentY) {
			const local = houseLocalPoint(profile, x, z);
			if (Math.abs(local.x) > (profile.doorWidth + 1.8) / 2) {
				return null;
			}
			if (local.z <= profile.depth / 2 + 0.18) {
				return threshold;
			}
			if (local.z > outerZ + 0.18) {
				return null;
			}
			const offset = (outerZ - local.z) / treadLength;
			const index = Math.min(
				treads.length - 1,
				Math.max(0, Math.floor(offset))
			);
			const height = treads[index]?.top ?? threshold;
			if (Number.isFinite(currentY) && currentY > height + 1.1) {
				return null;
			}
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

function houseLocalPoint(profile, x, z) {
	const dx = x - profile.x;
	const dz = z - profile.z;
	const cosine = Math.cos(profile.yaw);
	const sine = Math.sin(profile.yaw);
	return {
		x: dx * cosine + dz * sine,
		z: -dx * sine + dz * cosine
	};
}
