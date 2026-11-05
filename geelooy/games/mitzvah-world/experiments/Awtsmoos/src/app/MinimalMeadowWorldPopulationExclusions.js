// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWorldPopulationExclusions.js
 * @description Measures road, home, threshold, quest, clearing, river, lake, and world clearances.
 * The Awtsmoos gives growth its place and passage its place; Awtsmoos.com lets every root know
 * the exact boundary where living density must bow before a door, a road, or another mitzvah.
 */

import { minimalMeadowRoadDistance } from './MinimalMeadowBezierPath.js';
import { MINIMAL_MEADOW_HOUSE_PROFILES } from './MinimalMeadowHouseProfiles.js';
import {
	MINIMAL_MEADOW_COMBAT_CLEARINGS,
	MINIMAL_MEADOW_PLAYABLE_HALF_SIZE,
	MINIMAL_MEADOW_QUEST_ACCESS
} from './MinimalMeadowWorldPopulationConfig.js';
import {
	minimalMeadowLakeDistance,
	minimalMeadowRiverNearest
} from './MinimalMeadowRiverPath.js';

const POLICIES = Object.freeze({
	'bank-vegetation': Object.freeze({ house: 2.5, lake: 1.04, quest: 7, road: 6.2 }),
	tree: Object.freeze({ house: 5, lake: 1.28, quest: 12, road: 10 }),
	vegetation: Object.freeze({ house: 2.5, lake: 1.08, quest: 7, road: 6.2 })
});

export function minimalMeadowPopulationClearance(x, z) {
	const river = minimalMeadowRiverNearest(x, z);
	return Object.freeze({
		clearing: circleClearance(x, z, MINIMAL_MEADOW_COMBAT_CLEARINGS),
		entrance: entranceClearance(x, z),
		house: houseClearance(x, z),
		insidePlayable: Math.abs(x) <= MINIMAL_MEADOW_PLAYABLE_HALF_SIZE
			&& Math.abs(z) <= MINIMAL_MEADOW_PLAYABLE_HALF_SIZE,
		lake: minimalMeadowLakeDistance(x, z),
		quest: Math.hypot(x - MINIMAL_MEADOW_QUEST_ACCESS.x, z - MINIMAL_MEADOW_QUEST_ACCESS.z)
			- MINIMAL_MEADOW_QUEST_ACCESS.radius,
		river,
		riverGap: river.distance - river.width,
		road: minimalMeadowRoadDistance(x, z)
	});
}

export function minimalMeadowPopulationAllows(x, z, role = 'vegetation') {
	const policy = POLICIES[role] || POLICIES.vegetation;
	const evidence = minimalMeadowPopulationClearance(x, z);
	const riverAllowed = role === 'bank-vegetation'
		? evidence.riverGap >= 1.2 && evidence.riverGap <= 7.5
		: evidence.riverGap >= (role === 'tree' ? 5.5 : 1.6);
	return evidence.insidePlayable
		&& evidence.road >= policy.road
		&& evidence.house >= policy.house
		&& evidence.entrance >= 2
		&& evidence.quest >= policy.quest
		&& evidence.clearing >= 0
		&& evidence.lake >= policy.lake
		&& riverAllowed;
}

function houseClearance(x, z) {
	let nearest = Infinity;
	for (const profile of MINIMAL_MEADOW_HOUSE_PROFILES) {
		nearest = Math.min(nearest, orientedRectangleClearance(
			x,
			z,
			profile.x,
			profile.z,
			profile.width / 2,
			profile.depth / 2,
			profile.yaw
		));
	}
	return nearest;
}

function entranceClearance(x, z) {
	let nearest = Infinity;
	for (const profile of MINIMAL_MEADOW_HOUSE_PROFILES) {
		const yaw = profile.yaw || 0;
		const centerDistance = profile.depth / 2 + 9;
		const centerX = profile.x + Math.sin(yaw) * centerDistance;
		const centerZ = profile.z + Math.cos(yaw) * centerDistance;
		nearest = Math.min(nearest, orientedRectangleClearance(x, z, centerX, centerZ, 5, 9, yaw));
	}
	return nearest;
}

function orientedRectangleClearance(x, z, centerX, centerZ, halfWidth, halfDepth, yaw) {
	const dx = x - centerX;
	const dz = z - centerZ;
	const cosine = Math.cos(yaw || 0);
	const sine = Math.sin(yaw || 0);
	const localX = Math.abs(dx * cosine - dz * sine) - halfWidth;
	const localZ = Math.abs(dx * sine + dz * cosine) - halfDepth;
	return Math.max(localX, localZ);
}

function circleClearance(x, z, circles) {
	return Math.min(...circles.map(circle => Math.hypot(x - circle.x, z - circle.z) - circle.radius));
}
