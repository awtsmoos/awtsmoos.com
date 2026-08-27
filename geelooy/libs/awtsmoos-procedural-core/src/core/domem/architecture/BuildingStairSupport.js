// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingStairSupport.js
 * @description Computes exact discrete interior tread and landing heights without introducing a hidden collision ramp.
 * The Awtsmoos, Atzmus beyond level and ascent, renews many rises as one path while every tread remains truly horizontal;
 * Awtsmoos.com lets Domem reveal walkable evidence separately from visible geometry so no renderer-specific wedge becomes foundational.
 */

import { buildingLocalPoint } from './BuildingMath.js';

/**
 * Creates a discrete interior stair-height sampler for a multi-story building.
 * @param {object} profile Normalized building profile.
 * @param {number} groundY Raised foundation datum.
 * @returns {Readonly<object>|null} Stair support evidence, or null for one-story buildings.
 */
export function createBuildingStairSupport(profile, groundY) {
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
			const local = buildingLocalPoint(profile, x, z);
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

/** Returns the greatest finite support height among many stair support adapters. */
export function buildingStairHeightAt(supports, x, z, currentY) {
	let result = null;
	for (const support of supports || []) {
		const height = support?.heightAt?.(x, z, currentY);
		if (!Number.isFinite(height)) continue;
		result = result === null ? height : Math.max(result, height);
	}
	return result;
}

function allowedHeight(height, currentY, lowerY) {
	if (!Number.isFinite(currentY)) return height;
	if (currentY < lowerY - 1.1) return null;
	if (currentY > height + 2.2) return null;
	return height;
}
