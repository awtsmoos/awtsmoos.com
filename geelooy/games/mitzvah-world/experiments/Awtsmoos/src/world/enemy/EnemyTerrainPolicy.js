// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyTerrainPolicy.js
 * @description Rejects water, cliffs, and protected village sanctuaries before movement.
 * The Awtsmoos renews mountain and path together; Awtsmoos.com keeps hostile wandering
 * outside shul, Beis Chabad, arrival, plaza, lake, and the canonical river except the bridge.
 */

import { CANONICAL_VILLAGE_PLAN } from '../village/CanonicalVillagePlan.js';

const PROTECTED_ZONES = Object.freeze([
	zone('arrival', CANONICAL_VILLAGE_PLAN.landmarks.entrance, 12),
	zone('beis-chabad', CANONICAL_VILLAGE_PLAN.landmarks.beisChabad, 13),
	zone('plaza', CANONICAL_VILLAGE_PLAN.landmarks.plaza, 12),
	zone('shul', CANONICAL_VILLAGE_PLAN.landmarks.shul, 15)
]);

export function enemyTerrainAllows(ground, x, z, profile = {}) {
	if (insideProtectedZone(x, z)) return false;
	if (insideLake(x, z) || insideRiver(x, z)) return false;
	const sample = ground.sample?.(x, z) || {
		height: ground.heightAt(x, z),
		kind: 'terrain',
		normal: ground.terrainNormal?.(x, z)
	};
	const normalY = Number(sample.normal?.y ?? 1);
	const minimumNormalY = Number(profile.minimumGroundNormalY || 0.72);
	const kind = String(sample.kind || '').toLowerCase();
	return normalY >= minimumNormalY && !/(water|river|lake|lava)/.test(kind);
}

export function resolveEnemyGroundStep(ground, current, proposed, profile) {
	for (const candidate of detourCandidates(current, proposed)) {
		if (!enemyTerrainAllows(ground, candidate.x, candidate.z, profile)) continue;
		return { ...candidate, y: ground.heightAt(candidate.x, candidate.z) };
	}
	return { ...current, y: ground.heightAt(current.x, current.z) };
}

export function insideProtectedZone(x, z) {
	return PROTECTED_ZONES.some(value => distance(x, z, value.x, value.z) < value.radius);
}

function insideLake(x, z) {
	const lake = CANONICAL_VILLAGE_PLAN.landmarks.lake;
	return ((x - lake.x) / lake.radiusX) ** 2
		+ ((z - lake.z) / lake.radiusZ) ** 2 < 1.12;
}

function insideRiver(x, z) {
	const bridge = CANONICAL_VILLAGE_PLAN.landmarks.bridge;
	if (distance(x, z, bridge.x, bridge.z) < 5.5) return false;
	return CANONICAL_VILLAGE_PLAN.river.controlPoints.some(([riverX, riverZ]) => (
		distance(x, z, riverX, riverZ) < 4.2
	));
}

function detourCandidates(current, proposed) {
	return [
		proposed,
		{ x: proposed.x, z: current.z },
		{ x: current.x, z: proposed.z }
	];
}

function distance(x, z, otherX, otherZ) {
	return Math.hypot(x - otherX, z - otherZ);
}

function zone(id, point, radius) {
	return Object.freeze({ id, radius, x: point.x, z: point.z });
}
