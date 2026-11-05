// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageStagingAudit.js
 * @description Audits physical actor occupancy separately from the larger protected composition zone around each stage.
 * The Awtsmoos gives body, road, house, earth, and stream their proper measure anew; Awtsmoos.com keeps scenery breathing room large
 * while a realistic human envelope governs collision safety, so game and Studio share one precise staging contract without false giants.
 */

import { worldSpatialEvidenceAt } from '../spatial/WorldSpatialRealismApi.js';
import { villageStagingGroundEvidence } from './VillageStagingGroundEvidence.js';

const FOOTPRINT_BUFFER = 0.35;
const CINEMATIC_ROAD_BUFFER = 0.5;
const CINEMATIC_WATER_BUFFER = 0.35;
const GAMEPLAY_WATER_BUFFER = 0.25;

export function auditVillageStaging(profile) {
	const findings = [];
	const pads = (profile?.staging || []).map(value => auditPad(value, findings));
	return Object.freeze({
		findings: Object.freeze(findings),
		pads: Object.freeze(pads),
		ready: findings.length === 0
	});
}

function auditPad(pad, findings) {
	const ground = villageStagingGroundEvidence(pad);
	const spatial = worldSpatialEvidenceAt(pad.position);
	const occupancyRadius = physicalRadius(pad);
	const riverClearance = spatial.water?.edgeClearance ?? ground.riverClearance;
	const roadClearance = spatial.road?.edgeClearance ?? Number.POSITIVE_INFINITY;
	const footprintClearance = spatial.footprint?.edgeClearance ?? Number.POSITIVE_INFINITY;
	const requiredRiver = riverRequirement(pad, occupancyRadius);
	const requiredRoad = pad.role === 'cinematic-actor'
		? occupancyRadius + CINEMATIC_ROAD_BUFFER
		: null;
	const requiredFootprint = occupancyRadius + FOOTPRINT_BUFFER;
	if (requiredRiver !== null && riverClearance < requiredRiver) {
		findings.push(finding('staging-river-intrusion', pad.id, riverClearance, requiredRiver, spatial.water?.sourceId));
	}
	if (ground.nearbyWater && ground.verticalWaterClearance < 0.75) {
		findings.push(finding('staging-below-water-surface', pad.id, ground.verticalWaterClearance, 0.75, 'canonical-village-river'));
	}
	if (footprintClearance < requiredFootprint) {
		findings.push(finding('staging-footprint-intrusion', pad.id, footprintClearance, requiredFootprint, spatial.footprint?.sourceId));
	}
	if (requiredRoad !== null && roadClearance < requiredRoad) {
		findings.push(finding('staging-road-intrusion', pad.id, roadClearance, requiredRoad, spatial.road?.sourceId));
	}
	return Object.freeze({
		footprintClearance,
		ground: pad.ground,
		id: pad.id,
		nearbyWater: ground.nearbyWater,
		occupancyRadius,
		protectedRadius: pad.radius,
		requiredFootprint,
		requiredRiver,
		requiredRoad,
		riverClearance,
		roadClearance,
		role: pad.role,
		spatialSchemaVersion: spatial.schemaVersion,
		terrainY: ground.terrainY,
		verticalWaterClearance: ground.verticalWaterClearance,
		waterY: ground.waterY
	});
}

function physicalRadius(pad) {
	const value = Number(pad.occupancyRadius);
	return Number.isFinite(value) && value > 0
		? value
		: pad.role === 'cinematic-actor' ? 0.75 : 0.65;
}

function riverRequirement(pad, occupancyRadius) {
	if (pad.ground === 'bridge-approach') return null;
	const buffer = pad.role === 'cinematic-actor'
		? CINEMATIC_WATER_BUFFER
		: GAMEPLAY_WATER_BUFFER;
	return occupancyRadius + buffer;
}

function finding(code, padId, clearance, required, sourceId = null) {
	return Object.freeze({ clearance, code, padId, required, severity: 'error', sourceId });
}
