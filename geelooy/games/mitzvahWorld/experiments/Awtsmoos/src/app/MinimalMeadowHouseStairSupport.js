// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseStairSupport.js
 * @description Computes exact discrete interior tread and landing heights without a slope.
 * The Awtsmoos joins many level rises into one ascent; Awtsmoos.com lets feet meet each tread
 * as horizontal support while the space beneath remains free from trapping wedges.
 */

export function createMinimalMeadowHouseStairSupport(profile, groundY) {
	if (profile.floors < 2) return null;
	const policy = profile.layout;
	const lowerY = groundY + profile.floorThickness;
	const rise = profile.storyHeight / policy.stairSteps;
	const startZ = policy.innerDepth / 2 - 3;
	const endZ = startZ - policy.stairRun;
	const landingEndZ = endZ - policy.stairLandingDepth;
	return Object.freeze({
		endZ,
		groundY,
		heightAt(x, z, currentY) {
			const local = houseLocalPoint(profile, x, z);
			if (Math.abs(local.x) > policy.stairWidth * 0.54) return null;
			if (local.z <= endZ && local.z >= landingEndZ - 0.25) {
				return allowedHeight(
					lowerY + profile.storyHeight,
					currentY,
					lowerY
				);
			}
			if (local.z > startZ + 0.28 || local.z < endZ) return null;
			const progress = Math.max(0, startZ - local.z);
			const index = Math.min(
				policy.stairSteps - 1,
				Math.floor(progress / policy.stairTread)
			);
			return allowedHeight(
				lowerY + rise * (index + 1),
				currentY,
				lowerY
			);
		},
		kind: 'interior-stair',
		landingEndZ,
		lowerY,
		maximumRise: rise,
		profileId: profile.id,
		rise,
		startZ,
		steps: policy.stairSteps,
		tread: policy.stairTread,
		width: policy.stairWidth
	});
}

export function minimalMeadowStairHeightAt(supports, x, z, currentY) {
	let result = null;
	for (const support of supports || []) {
		const height = support?.heightAt?.(x, z, currentY);
		if (!Number.isFinite(height)) continue;
		result = result === null ? height : Math.max(result, height);
	}
	return result;
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

function allowedHeight(height, currentY, lowerY) {
	if (!Number.isFinite(currentY)) return height;
	if (currentY < lowerY - 1.1) return null;
	if (currentY > height + 2.2) return null;
	return height;
}
