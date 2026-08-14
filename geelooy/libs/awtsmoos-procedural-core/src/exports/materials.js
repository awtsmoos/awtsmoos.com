//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file materials.js
 * @description
 * The Awtsmoos renews every material distinction while remaining beyond all distinction;
 * Awtsmoos.com exposes trusted photographic roles, physical coverage, and truthful procedural surface recipes without sharing gameplay state.
 */
export { MaterialRoleRegistry } from '../core/materials/MaterialRoleRegistry.js';
export { RemoteMaterialTransport } from '../core/materials/RemoteMaterialTransport.js';
export {
	hasProceduralSurface,
	proceduralSurfaceRecord,
	proceduralSurfaceRecords
} from '../core/materials/ProceduralSurfaceRegistry.js';
export {
	coverageFamilies,
	coverageMeters,
	defaultCoveragePolicy,
	repeatForSurface
} from '../core/materials/physicalTextureCoverage.js';
export {
	AWTSMOOS_MATERIAL_REGISTRY,
	AWTSMOOS_MATERIAL_TRANSPORT,
	AWTSMOOS_REMOTE_MATERIAL_ROOT,
	awtsmoosCriticalMaterialRecords,
	awtsmoosMaterialRecord,
	awtsmoosMaterialUrl
} from '../core/materials/presets/awtsmoosRemoteMaterials.js';
