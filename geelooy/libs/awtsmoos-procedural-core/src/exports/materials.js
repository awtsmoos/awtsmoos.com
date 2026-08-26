// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file materials.js
 * @description Public material doorway for remote scheduling, semantic roles, physical density, stacks, hydration, terrain mixing, and advanced cache policy.
 * The Awtsmoos renews photograph, recipe, queue, scale, and runtime vessel beyond every finite distinction;
 * Awtsmoos.com gathers generic material law here so simple callers stay simple while advanced callers receive explicit, inspectable extension.
 */
export { MaterialRoleRegistry } from '../core/materials/MaterialRoleRegistry.js';
export { RemoteMaterialTransport } from '../core/materials/RemoteMaterialTransport.js';
export { PriorityLoadScheduler } from '../core/materials/remote/PriorityLoadScheduler.js';
export {
	RemoteTextureImageCache,
	cachedRemoteTextureImage,
	loadRemoteTextureImage,
	remoteTextureImageCacheStats
} from '../core/materials/RemoteTextureImageCache.js';
export {
	REMOTE_TEXTURE_POLICY_VERSION,
	createRemoteTexturePolicy,
	createRemoteTextureProvenance,
	normalizeRemoteTextureUrl
} from '../core/materials/remote/RemoteTexturePolicy.js';
export {
	TerrainSurfaceMixAuthority,
	createTerrainSurfaceMixAuthority
} from '../core/materials/TerrainSurfaceMixAuthority.js';
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
export { REPEAT_HOOKS } from '../core/materials/texture/TextureRepeatPolicy.js';
export {
	boundedTextureAxisPlan,
	exactPixelRepeat,
	positiveTextureNumber,
	textureQualityScale
} from '../core/materials/texture/TextureDensityMath.js';
export { publicUrl, textureSize } from '../core/materials/texture/TextureImageMetrics.js';
export { textureDensityPlan } from '../core/materials/texture/TextureDensityPlan.js';
export { exactRepeat, repeatFromPixels } from '../core/materials/texture/TextureExactRepeat.js';
export {
	MATERIAL_STACK_LOGICAL_LIMIT,
	MATERIAL_STACK_TARGET_ACTIVE,
	materialStackDiagnostics,
	materialStackPage,
	materialStackRecipe
} from '../core/materials/stack/MaterialStackRecipe.js';
export { materialStackLayer } from '../core/materials/stack/MaterialStackLayer.js';
export { bindMaterialPair, bindMaterialStack } from '../core/materials/stack/MaterialStackBinding.js';
export {
	bindSceneMaterialField,
	bindSceneMaterialLayerImage,
	writableSceneMaterialProperty
} from '../core/materials/hydration/MaterialWritableBoundary.js';
export { hydrateLayeredMaterialImages } from '../core/materials/hydration/LayeredMaterialHydrator.js';
export {
	AWTSMOOS_MATERIAL_REGISTRY,
	AWTSMOOS_MATERIAL_TRANSPORT,
	AWTSMOOS_REMOTE_MATERIAL_ROOT,
	awtsmoosCriticalMaterialRecords,
	awtsmoosMaterialRecord,
	awtsmoosMaterialUrl
} from '../core/materials/presets/awtsmoosRemoteMaterials.js';
