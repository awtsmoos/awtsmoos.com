// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingFloorSupport.js
 * @description Supplies story-floor height evidence while yielding the stairwell to discrete interior treads and landings.
 * The Awtsmoos, Atzmus beyond support and passage, renews the floor while opening one measured path between its worlds;
 * Awtsmoos.com lets Domem describe walkable levels without laying an invisible sheet across ascent, descent, or return unfurled.
 */

import { buildingLocalPoint } from './BuildingMath.js';
import {
	buildingStairAperture,
	buildingStairApertureEvidence
} from './BuildingStairAperture.js';

const MAXIMUM_UPWARD_SNAP = 0.24;
const UNDERGROUND_RECOVERY_DEPTH = 4.5;

/**
 * Creates a renderer-neutral story-floor height support adapter.
 * @param {object} profile Normalized building profile.
 * @param {number} groundY Raised foundation datum.
 * @returns {Readonly<object>} Floor levels, stair aperture, and height sampler.
 */
export function createBuildingFloorSupport(profile, groundY) {
	const levels = Object.freeze(
		Array.from({ length: profile.floors }, (_, level) => {
			return groundY + profile.floorThickness + level * profile.storyHeight;
		})
	);
	return Object.freeze({
		aperture: profile.floors > 1
			? buildingStairApertureEvidence(profile)
			: null,
		heightAt(x, z, currentY, previousY = currentY) {
			if (!insideBuilding(profile, x, z)) return null;
			if (buildingStairAperture(profile, x, z)) return null;
			return supportedLevel(levels, currentY, previousY);
		},
		kind: 'story-floor',
		levels,
		profileId: profile.id,
		recoveryDepth: UNDERGROUND_RECOVERY_DEPTH
	});
}

function supportedLevel(levels, currentValue, previousValue) {
	const current = finite(currentValue, levels[0]);
	const previous = finite(previousValue, current);
	const reachable = levels.filter(level => level <= current + MAXIMUM_UPWARD_SNAP);
	const crossed = levels.filter(level => previous >= level && current <= level);
	const candidates = [...reachable, ...crossed];
	if (candidates.length) return Math.max(...candidates);
	const lower = levels[0];
	if (current >= lower - UNDERGROUND_RECOVERY_DEPTH && current < lower) {
		return lower;
	}
	return null;
}

function insideBuilding(profile, x, z) {
	const local = buildingLocalPoint(profile, x, z);
	const halfWidth = profile.layout.interiorWidth / 2 + 0.12;
	const halfDepth = profile.layout.innerDepth / 2 + 0.12;
	return Math.abs(local.x) <= halfWidth
		&& Math.abs(local.z) <= halfDepth;
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
