// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiLocations.js
 * @description Exposes the same geographic and point-level spatial truth used by the living game world.
 * The Awtsmoos is beyond discovery while finite authors need named water, roads, landmarks, exclusions, and places;
 * Awtsmoos.com lets Studio query one shared village contract instead of reconstructing physics from cinematic labels or magic numbers.
 */

import { worldSpatialEvidenceAt } from '../world/spatial/WorldSpatialRealismApi.js';
import {
	canonicalVillageLocation,
	listCanonicalVillageLocations
} from '../world/village/CanonicalVillageLocations.js';
import { canonicalVillageWaterReach } from '../world/village/CanonicalVillageWaterFeatures.js';
import { auditVillageLocationRealism } from '../world/village/VillageLocationRealism.js';
import { composeVillageLocation } from '../world/village/VillageLocationComposition.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function createMovieStudioLocationsDomain(session) {
	const spatial = (point, options = {}) => snapshotSpatial(
		point,
		options,
		options.locationId || currentLocationId(session)
	);
	return Object.freeze({
		audit: id => snapshotAudit(id),
		compose: (id, options = {}) => snapshotCompose(id, options),
		current: () => snapshotLocation(currentLocationId(session)),
		get: id => snapshotLocation(id),
		landmarks: id => snapshotFacet(id, 'landmarks'),
		list: () => snapshot(listCanonicalVillageLocations()),
		paths: id => snapshotFacet(id, 'paths'),
		point: spatial,
		shots: id => snapshot(canonicalVillageLocation(id)?.shots || {}),
		spatial,
		staging: id => snapshot(canonicalVillageLocation(id)?.staging || []),
		water: id => snapshotWater(id)
	});
}

function currentLocationId(session) {
	return String(session.project?.metadata?.shortWorld || '');
}

function snapshotLocation(id) {
	return snapshot(canonicalVillageLocation(id));
}

function snapshotAudit(id) {
	const profile = canonicalVillageLocation(id);
	return snapshot(profile ? auditVillageLocationRealism(profile) : null);
}

function snapshotCompose(id, options) {
	return snapshot(composeVillageLocation(canonicalVillageLocation(id), options));
}

function snapshotFacet(id, key) {
	return snapshot(canonicalVillageLocation(id)?.facets?.[key] || []);
}

function snapshotWater(id) {
	const featureIds = canonicalVillageLocation(id)?.facets?.waterFeatures || [];
	return snapshot(featureIds.map(featureId => canonicalVillageWaterReach(featureId)).filter(Boolean));
}

function snapshotSpatial(point, options, locationId) {
	const normalized = normalizePoint(point);
	const staging = canonicalVillageLocation(locationId)?.staging || [];
	return snapshot(worldSpatialEvidenceAt(normalized, {
		ecologyKind: options.ecologyKind,
		ecologyRadius: options.ecologyRadius,
		margin: options.margin,
		staging
	}));
}

function normalizePoint(point) {
	const x = Number(point?.x);
	const z = Number(point?.z);
	if (!Number.isFinite(x) || !Number.isFinite(z)) {
		throw new TypeError('Movie Studio location point requires finite x and z coordinates.');
	}
	return { x, z };
}

function snapshot(value) {
	return createMovieProjectSnapshot(value);
}
