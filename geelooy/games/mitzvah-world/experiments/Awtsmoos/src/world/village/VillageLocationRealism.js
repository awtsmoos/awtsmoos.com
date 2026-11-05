// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageLocationRealism.js
 * @description Combines shared spatial, camera, staging, and water-continuity evidence into one geographic realism report.
 * The Awtsmoos is beyond every finite audit yet creates each truthful relation anew; Awtsmoos.com gathers one report for game and film,
 * so Studio cannot approve a location the living world itself would reject, nor gameplay inherit a geography cinema secretly changed.
 */

import {
	worldSpatialClearanceSummary,
	worldSpatialEvidenceAt
} from '../spatial/WorldSpatialRealismApi.js';
import { auditCanonicalVillageWaterContinuity } from './CanonicalVillageWaterFeatures.js';
import { auditVillageCameraLane } from './VillageCameraLaneAudit.js';
import { villageRiverClearance } from './VillageRiverClearance.js';
import { auditVillageStaging } from './VillageStagingAudit.js';

export { villageRiverClearance } from './VillageRiverClearance.js';

export function auditVillageLocationRealism(profile) {
	const shots = Object.entries(profile?.shots || {}).map(([id, value]) => (
		auditVillageCameraLane(id, value, profile)
	));
	const staging = auditVillageStaging(profile);
	const water = auditCanonicalVillageWaterContinuity();
	const findings = [
		...shots.flatMap(value => value.findings),
		...staging.findings,
		...waterFindings(profile, water)
	];
	const focusSpatial = worldSpatialEvidenceAt(profile?.focus || { x: 0, z: 0 });
	const actorSpatial = profile?.actor
		? worldSpatialEvidenceAt(profile.actor)
		: null;
	return Object.freeze({
		actorSpatial: spatialSnapshot(actorSpatial),
		findings: Object.freeze(findings),
		focusSpatial: spatialSnapshot(focusSpatial),
		id: String(profile?.id || ''),
		issues: Object.freeze(findings.map(describeFinding)),
		ready: findings.length === 0,
		shotCount: shots.length,
		shots: Object.freeze(shots),
		spatialSchemaVersion: focusSpatial.schemaVersion,
		staging,
		waterContinuity: Object.freeze(water)
	});
}

function spatialSnapshot(evidence) {
	if (!evidence) return null;
	return Object.freeze({
		clearances: worldSpatialClearanceSummary(evidence),
		point: evidence.point,
		road: evidence.road,
		water: evidence.water
	});
}

function waterFindings(profile, water) {
	if (!(profile?.facets?.waterFeatures || []).length || water.ready) return [];
	return water.issues.map(message => Object.freeze({
		code: 'water-continuity',
		message,
		severity: 'error'
	}));
}

function describeFinding(finding) {
	if (finding.code === 'camera-safe-bounds') {
		return `${finding.laneId}:sample-${finding.sampleIndex} leaves camera-safe bounds.`;
	}
	if (finding.code === 'river-clearance' || finding.code === 'road-clearance') {
		return `${finding.laneId}:sample-${finding.sampleIndex} has ${format(finding.clearance)} ${finding.code}.`;
	}
	if (String(finding.code || '').startsWith('staging-')) {
		return `${finding.padId} fails ${finding.code} with ${format(finding.clearance)} clearance.`;
	}
	return finding.message || finding.code || 'Unknown realism finding.';
}

function format(value) {
	return Number.isFinite(value) ? value.toFixed(2) : String(value);
}
