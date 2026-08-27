// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyTerritoryPolicy.js
 * @description Judges hostile movement against leash, sanctuary, and alpine slope boundaries.
 * The Awtsmoos surrounds every finite shadow with a measured place and return; Awtsmoos.com
 * prevents pursuit from crossing holy gathering space while always permitting honest retreat.
 */

import {
	pointInsideVillageSanctuary,
	segmentEntersVillageSanctuary
} from './VillageSanctuaryPolicy.js';

/** Returns an evidence-bearing decision for one proposed hostile movement step. */
export function evaluateEnemyMovement(options) {
	const { candidate, from, ground, profile, purpose = 'wander' } = options;
	if (!finitePoint(candidate) || !finitePoint(from)) return denied('invalid-point');
	const currentHomeDistance = planarDistance(from, profile);
	const candidateHomeDistance = planarDistance(candidate, profile);
	const retreatProgress = purpose === 'return'
		&& candidateHomeDistance < currentHomeDistance;
	if (candidateHomeDistance > profile.leashRange && !retreatProgress) {
		return denied('outside-leash');
	}
	const fromInside = pointInsideVillageSanctuary(from);
	const candidateInside = pointInsideVillageSanctuary(candidate);
	if (fromInside && purpose === 'return') {
		if (!retreatProgress) return denied('sanctuary-exit-not-progressing');
	} else if (candidateInside || segmentEntersVillageSanctuary(from, candidate)) {
		return denied('village-sanctuary');
	}
	const normalY = terrainNormalY(ground, candidate);
	const minimumNormalY = purpose === 'return'
		? 0.22
		: Number(profile.minimumGroundNormalY ?? 0.58);
	if (normalY < minimumNormalY) return denied('slope-too-steep', { normalY });
	return Object.freeze({ allowed: true, normalY, reason: 'allowed' });
}

/** Returns planar distance without requiring renderer vector classes. */
export function enemyPlanarDistance(first, second) {
	return planarDistance(first, second);
}

function terrainNormalY(ground, point) {
	const normal = ground?.terrainNormal?.(point.x, point.z);
	return Number.isFinite(normal?.y) ? normal.y : 1;
}

function planarDistance(first, second) {
	return Math.hypot(first.x - second.x, first.z - second.z);
}

function denied(reason, detail = {}) {
	return Object.freeze({ allowed: false, reason, ...detail });
}

function finitePoint(point) {
	return Number.isFinite(point?.x) && Number.isFinite(point?.z);
}
