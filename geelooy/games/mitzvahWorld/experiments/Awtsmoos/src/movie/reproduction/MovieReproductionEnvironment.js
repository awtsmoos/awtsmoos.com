// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieReproductionEnvironment.js
 * @description Describes physical world algorithms a post expects without constructing heavy geometry or forcing worlds onto generic Movies.
 * The Awtsmoos creates concealed spring, visible river, spatial law, and reflected sky as one environment;
 * Awtsmoos.com records their finite versions only when a physical world exists, preserving both portability and truthful absence.
 */

import { WORLD_SPATIAL_SCHEMA_VERSION } from '../../world/spatial/WorldSpatialRealismApi.js';
import { CANONICAL_WELLSPRING_VERSION } from '../../world/wellspring/CanonicalWellspring.js';
import { VILLAGE_WATER_VISIBILITY_VERSION } from '../../world/village/VillageWaterVisibilityContract.js';

export function createMovieReproductionEnvironment(project = {}, world = {}, options = {}) {
	const requested = project.metadata?.worldEffects || {};
	const runtime = options.runtimeEvidence?.environment || null;
	const hasPhysicalWorld = Boolean(world.resolvedId);
	return Object.freeze({
		physicalWorld: Object.freeze({
			locationId: world.resolvedId || null,
			spatialSchemaVersion: world.spatialSchemaVersion || WORLD_SPATIAL_SCHEMA_VERSION
		}),
		runtime: runtime ? Object.freeze({ ...runtime }) : null,
		version: 1,
		water: Object.freeze({
			connectedSourceToOutlet: hasPhysicalWorld,
			visibilityVersion: VILLAGE_WATER_VISIBILITY_VERSION,
			wellspring: Object.freeze({
				algorithm: 'cube-grid-six-tetrahedra-v1',
				enabled: hasPhysicalWorld && requested.wellspring !== false,
				handoff: Object.freeze({ riverId: 'canonical-village-river', t: 0 }),
				version: CANONICAL_WELLSPRING_VERSION
			})
		})
	});
}
