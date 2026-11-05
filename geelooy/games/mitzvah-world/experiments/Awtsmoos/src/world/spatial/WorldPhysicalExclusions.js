// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldPhysicalExclusions.js
 * @description Publishes allocation-light occupied-area evidence while refusing coarse road-proxy circles as spatial truth.
 * The Awtsmoos creates house, courtyard, path, and open bank without confusing their vessels; Awtsmoos.com scans many finite shapes
 * but allocates only the nearest evidence, keeping rich ecology and Studio diagnostics truthful without burdening world entry.
 */

import { CANONICAL_VILLAGE_CLEARINGS } from '../village/CanonicalVillageClearings.js';
import { CANONICAL_VILLAGE_FOOTPRINTS } from '../village/CanonicalVillageFootprints.js';
import {
	signedCircleClearanceXZ,
	signedOrientedRectangleClearanceXZ
} from './WorldSpatialMath.js';

const ROAD_PROXY_CLEARING_IDS = new Set(['bridge-approach', 'farm-crossing', 'riverfront-path']);
const TRUE_AREA_CLEARINGS = Object.freeze(
	CANONICAL_VILLAGE_CLEARINGS.filter(clearing => !ROAD_PROXY_CLEARING_IDS.has(clearing.id))
);

export function physicalExclusionEvidenceAt(point, options = {}) {
	return nearestEvidence([
		footprintExclusionEvidenceAt(point, options),
		clearingExclusionEvidenceAt(point, options),
		stagingExclusionEvidenceAt(point, options)
	]);
}

export function footprintExclusionEvidenceAt(point, options = {}) {
	const footprints = options.footprints || CANONICAL_VILLAGE_FOOTPRINTS;
	return nearestShapeEvidence(
		footprints,
		'footprint',
		item => item.id,
		item => signedOrientedRectangleClearanceXZ(point, item),
		normalizedMargin(options.margin)
	);
}

export function clearingExclusionEvidenceAt(point, options = {}) {
	const clearings = options.clearings || TRUE_AREA_CLEARINGS;
	return nearestShapeEvidence(
		clearings,
		'clearing',
		item => item.id,
		item => signedCircleClearanceXZ(point, item, item.radius),
		normalizedMargin(options.margin)
	);
}

export function stagingExclusionEvidenceAt(point, options = {}) {
	return nearestShapeEvidence(
		options.staging || [],
		'staging',
		item => item.id || item.role || 'staging-pad',
		item => signedCircleClearanceXZ(point, item.position || item, item.radius || 0),
		normalizedMargin(options.margin)
	);
}

export function trueAreaClearings() {
	return TRUE_AREA_CLEARINGS;
}

export function isRoadProxyClearing(id) {
	return ROAD_PROXY_CLEARING_IDS.has(String(id || ''));
}

function nearestShapeEvidence(items, kind, idOf, clearanceOf, margin) {
	let sourceId = null;
	let edgeClearance = Number.POSITIVE_INFINITY;
	for (const item of items) {
		const next = clearanceOf(item);
		if (next >= edgeClearance) continue;
		edgeClearance = next;
		sourceId = idOf(item);
	}
	return sourceId === null ? null : evidence(kind, sourceId, edgeClearance, margin);
}

function nearestEvidence(values) {
	let best = null;
	for (const value of values) {
		if (!value || (best && value.clearance >= best.clearance)) continue;
		best = value;
	}
	return best;
}

function evidence(kind, sourceId, edgeClearance, margin) {
	const clearance = edgeClearance - margin;
	return Object.freeze({
		clearance,
		edgeClearance,
		inside: edgeClearance <= 0,
		kind,
		sourceId,
		withinMargin: clearance <= 0
	});
}

function normalizedMargin(value) {
	return Math.max(0, Number(value) || 0);
}
