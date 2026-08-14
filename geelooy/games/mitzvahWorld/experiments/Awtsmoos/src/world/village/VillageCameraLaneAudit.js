// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCameraLaneAudit.js
 * @description Audits complete cinematic lanes against terrain, road, river, authored bounds, and above-ground look-at targets.
 * The Awtsmoos sustains every instant between beginning and end; Awtsmoos.com therefore measures the lens against the mountain itself,
 * so a generated film cannot pass merely because its X/Z path is clean while the camera or its target is buried inside terrain.
 */

import { worldSpatialEvidenceAt } from '../spatial/WorldSpatialRealismApi.js';
import { cameraTerrainClearance } from './VillageCameraGrounding.js';

export function auditVillageCameraLane(id, shot, profile) {
	const samples = sampleLane(shot.from, shot.to);
	const findings = [];
	const minimums = profile?.facets?.minimumClearances || {};
	const requiredWater = minimums.river ?? 0;
	const requiredRoad = minimums.cameraRoad ?? 0;
	const requiredTerrain = minimums.cameraTerrain ?? 0;
	const requiredTargetTerrain = minimums.cameraTargetTerrain ?? 0;
	let minimumRiverClearance = Number.POSITIVE_INFINITY;
	let minimumRoadClearance = Number.POSITIVE_INFINITY;
	let minimumTerrainClearance = Number.POSITIVE_INFINITY;
	for (const [index, point] of samples.entries()) {
		const spatial = worldSpatialEvidenceAt(point, { staging: profile?.staging || [] });
		const riverClearance = spatial.water?.edgeClearance ?? Number.POSITIVE_INFINITY;
		const roadClearance = spatial.road?.edgeClearance ?? Number.POSITIVE_INFINITY;
		const terrainClearance = cameraTerrainClearance(point);
		minimumRiverClearance = Math.min(minimumRiverClearance, riverClearance);
		minimumRoadClearance = Math.min(minimumRoadClearance, roadClearance);
		minimumTerrainClearance = Math.min(minimumTerrainClearance, terrainClearance);
		if (profile?.cameraSafeBounds && !inside(point, profile.cameraSafeBounds)) {
			findings.push(finding('camera-safe-bounds', id, index, point));
		}
		if (requiredWater > 0 && riverClearance < requiredWater) {
			findings.push(finding('river-clearance', id, index, point, riverClearance, requiredWater, spatial.water?.sourceId));
		}
		if (requiredRoad > 0 && roadClearance < requiredRoad) {
			findings.push(finding('road-clearance', id, index, point, roadClearance, requiredRoad, spatial.road?.sourceId));
		}
		if (requiredTerrain > 0 && terrainClearance < requiredTerrain) {
			findings.push(finding('terrain-clearance', id, index, point, terrainClearance, requiredTerrain, 'canonical-terrain'));
		}
	}
	const targetTerrainClearance = shot.target ? cameraTerrainClearance(shot.target) : Number.POSITIVE_INFINITY;
	if (requiredTargetTerrain > 0 && targetTerrainClearance < requiredTargetTerrain) {
		findings.push(finding('target-terrain-clearance', id, -1, shot.target, targetTerrainClearance, requiredTargetTerrain, 'canonical-terrain'));
	}
	return Object.freeze({
		findings: Object.freeze(findings),
		from: shot.from,
		id,
		minimumRiverClearance,
		minimumRoadClearance,
		minimumTerrainClearance,
		ready: findings.length === 0,
		sampleCount: samples.length,
		targetTerrainClearance,
		to: shot.to
	});
}

function sampleLane(from, to) {
	const distance = Math.hypot(to.x - from.x, to.y - from.y, to.z - from.z);
	const segments = Math.max(2, Math.min(18, Math.ceil(distance / 2.5)));
	return Array.from({ length: segments + 1 }, (_, index) => {
		const t = index / segments;
		return Object.freeze({
			x: from.x + (to.x - from.x) * t,
			y: from.y + (to.y - from.y) * t,
			z: from.z + (to.z - from.z) * t
		});
	});
}

function finding(code, laneId, sampleIndex, point, clearance = null, required = null, sourceId = null) {
	return Object.freeze({ clearance, code, laneId, point, required, sampleIndex, severity: 'error', sourceId });
}

function inside(point, box) {
	return ['x', 'y', 'z'].every(axis => point[axis] >= box.min[axis] && point[axis] <= box.max[axis]);
}
