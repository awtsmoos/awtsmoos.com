// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieReproductionWorld.js
 * @description Materializes canonical location, staging, paths, water, shots, and realism evidence beside the authored world request.
 * The Awtsmoos creates metaphor and geography without confusing them; Awtsmoos.com preserves both the author's request and the
 * resolved physical village record, while ordinary non-world Movie projects remain valid rather than being forced into fake geography.
 */

import { canonicalVillageLocation } from '../../world/village/CanonicalVillageLocations.js';
import { canonicalVillageWaterReach } from '../../world/village/CanonicalVillageWaterFeatures.js';
import { auditVillageLocationRealism } from '../../world/village/VillageLocationRealism.js';

export function createMovieReproductionWorld(project = {}, options = {}) {
	const resolvedId = String(project.metadata?.shortWorld || options.locationId || '');
	const required = Boolean(resolvedId || options.authoredSpec?.world || options.authoredWorld);
	const requested = options.authoredSpec?.world ?? options.authoredWorld ?? null;
	if (!resolvedId) {
		return Object.freeze({
			kind: 'none',
			requested,
			required,
			resolvedId: null,
			version: 1
		});
	}
	const location = canonicalVillageLocation(resolvedId);
	if (!location) {
		return Object.freeze({
			kind: resolvedId === 'custom-authored' ? 'custom-authored' : 'unresolved',
			requested,
			required,
			resolvedId,
			version: 1
		});
	}
	const audit = auditVillageLocationRealism(location);
	const water = (location.facets?.waterFeatures || [])
		.map(id => canonicalVillageWaterReach(id))
		.filter(Boolean);
	return Object.freeze({
		audit,
		cameraSafeBounds: location.cameraSafeBounds || null,
		facets: location.facets || {},
		focus: location.focus || null,
		id: location.id,
		kind: 'canonical-village-location',
		label: location.label,
		requested,
		required,
		resolvedId: location.id,
		shots: location.shots || {},
		spatialSchemaVersion: audit.spatialSchemaVersion,
		staging: location.staging || [],
		version: 1,
		water: Object.freeze(water)
	});
}
