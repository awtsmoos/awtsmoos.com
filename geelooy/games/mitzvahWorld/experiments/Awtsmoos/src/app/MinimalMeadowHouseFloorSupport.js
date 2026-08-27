// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseFloorSupport.js
 * @description Supplies story floors while yielding the stairwell to discrete bidirectional treads.
 * The Awtsmoos sustains every room yet opens one measured path between them; Awtsmoos.com keeps
 * immense interiors solid without placing an invisible upper floor across ascent, descent, or return.
 */

import {
	minimalMeadowHouseLocalPoint,
	minimalMeadowHouseStairAperture,
	minimalMeadowHouseStairApertureEvidence
} from './MinimalMeadowHouseStairAperture.js';

const MAXIMUM_UPWARD_SNAP = 0.24;
const UNDERGROUND_RECOVERY_DEPTH = 4.5;

export function createMinimalMeadowHouseFloorSupport(profile, groundY) {
	const levels = Object.freeze(Array.from({ length: profile.floors }, (_, level) => {
		return groundY + profile.floorThickness + level * profile.storyHeight;
	}));
	return Object.freeze({
		aperture: profile.floors > 1
			? minimalMeadowHouseStairApertureEvidence(profile)
			: null,
		heightAt(x, z, currentY, previousY = currentY) {
			if (!insideHouse(profile, x, z)) return null;
			if (minimalMeadowHouseStairAperture(profile, x, z)) return null;
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
	if (current >= lower - UNDERGROUND_RECOVERY_DEPTH && current < lower) return lower;
	return null;
}

function insideHouse(profile, x, z) {
	const local = minimalMeadowHouseLocalPoint(profile, x, z);
	const halfWidth = profile.layout.interiorWidth / 2 + 0.12;
	const halfDepth = profile.layout.innerDepth / 2 + 0.12;
	return Math.abs(local.x) <= halfWidth && Math.abs(local.z) <= halfDepth;
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
