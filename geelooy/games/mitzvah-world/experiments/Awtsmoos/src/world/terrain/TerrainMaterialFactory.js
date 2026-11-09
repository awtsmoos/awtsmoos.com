//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file TerrainMaterialFactory.js
 * @description Preserves legacy MitzvahWorld alpine layer selection while Procedural Core owns native layered-terrain materialization.
 * Game compatibility code may still choose its historical ecological recipe, quality vectors, and trusted remote images,
 * but it no longer constructs renderer materials; active terrain already uses Core's higher-level cinematic terrain API directly.
 *
 * Chapter 4 Task 4: the grass map sampling now comes from GrassGroundMaterial —
 * the one shared texture-only grass ground material. The old factory shipped
 * `anisotropy: false`, an arbitrary `mapRepeat: [10, 10]`, and no color-space
 * or mipmap policy: stretched, coarse foreground sampling. The repeat is now
 * derived from real source pixels at a per-tier texel density, anisotropy is
 * 8 desktop / 4 mobile, and the policy carries sRGB + mipmaps +
 * LinearMipmapLinear. No new texture is fetched: the default base map is the
 * existing catalog `baseGrass` entry.
 */
import { createLayeredTerrainMaterial } from '../../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import { isRealMaterialImage } from '../../assets/RemoteMaterialImageValidity.js';
import { isRemoteMaterialUrl } from '../../assets/PublicMaterialRemoteProvenance.js';
import { mainRiverVillageSurfaceMix } from '../materials/MainRiverVillageSurfaceMix.js';
import { materialStackDiagnostics } from '../materials/MaterialStackRecipe.js';
import { terrainLayerRecipe } from './TerrainLayerRecipe.js';
import { terrainRealismProfile } from './TerrainRealismProfile.js';
import {
	GRASS_GROUND_SOURCE,
	createGrassGroundMaterialSpec
} from './GrassGroundMaterial.js';

const TERRAIN_NEUTRAL_TINT = Object.freeze([1, 1, 1, 1]);
const TERRAIN_UV_UNITS_PER_WORLD = Object.freeze([0.035, 0.035]);
export const TERRAIN_CINEMATIC_MIX_STRENGTH = 0;
export const TERRAIN_CINEMATIC_PATCH_SCALE = 0.024;

/**
 * Create the historical MitzvahWorld terrain recipe through Core's shared layered material vessel.
 * @param {object} options Quality plus optional already-decoded remote grass/dirt images.
 * @returns {object} Core-created native terrain material carrying the legacy semantic recipe.
 */
export function createTerrainMaterial(options = {}) {
	const quality = options.quality || 'medium';
	const recipe = terrainLayerRecipe(quality);
	const realism = terrainRealismProfile(quality);
	const surfaceMix = mainRiverVillageSurfaceMix(recipe.layers, quality);	const mapImage = remoteImage(options.grassImage);
	const mixImage = remoteImage(options.dirtImage);
	const grassSpec = createGrassGroundMaterialSpec({
		mobile: options.mobile === true,
		quality,
		sourceHeight: options.grassImageHeight,
		sourceWidth: options.grassImageWidth,
		worldDepth: options.worldDepth,
		worldWidth: options.worldWidth
	});
	const textureUrl = remoteUrl(options.fallbackUrl, mapImage) || GRASS_GROUND_SOURCE.primary;
	const mixTextureUrl = remoteUrl(null, mixImage);
	return createLayeredTerrainMaterial({
		anisotropy: grassSpec.anisotropy,
		color: TERRAIN_NEUTRAL_TINT,
		mapImage,
		mapRepeat: [...grassSpec.repeat],
		materialStack: recipe.stack,
		mixImage,
		mixPatchScale: TERRAIN_CINEMATIC_PATCH_SCALE,
		mixPatchSharpness: 0.74,
		mixRepeat: [1, 1],
		mixStrength: TERRAIN_CINEMATIC_MIX_STRENGTH,
		mixTextureUrl,
		name: 'Awtsmoos_canonical_remote_alpine_valley',
		roughness: 0.92,
		semanticRole: 'terrain.grass',
		terrainMixingA: realism.a,
		terrainMixingB: realism.b,
		terrainMixingC: realism.c,
		textureLayers: surfaceMix.layers,
		texturePolicy: terrainPolicy(recipe, realism, surfaceMix, mapImage, mixImage, grassSpec),
		textureUrl
	});
}

/** Preserve the legacy ecology diagnostics while Core owns the material object that carries them. */
function terrainPolicy(recipe, realism, surfaceMix, mapImage, mixImage, grassSpec) {	return {
		...grassSpec.texturePolicy,
		baseSource: mapImage ? 'verified-remote-image-at-construction' : 'remote-only-semantic-terrain',
		fullResolutionEcologicalLayers: true,
		grassGroundMaterialId: grassSpec.materialId,
		grassGroundSourceUrl: grassSpec.sourceUrl,
		grassTileWorldMeters: grassSpec.tileWorld,
		hydration: mapImage ? 'ready-at-construction' : 'shared-cache-bounded-real-remote-page',
		layerCount: surfaceMix.layers.length,
		logicalLayerCount: recipe.logicalLayerCount,
		macroMixing: Object.freeze({ a: realism.a, b: realism.b, c: realism.c }),
		materialStackDiagnostics: materialStackDiagnostics(recipe.stack, 10),
		mix: 'zone-slope-height-wetness-plus-real-remote-layers',
		nativeTexelDensity: true,
		realBaseImage: Boolean(mapImage),
		realMixImage: Boolean(mixImage),
		remoteOnly: true,
		repeatMode: 'per-layer-ecological-repeat',
		selectedRoles: surfaceMix.stats.selectedRoles,
		semanticRole: 'terrain.grass',
		shader: recipe.shader,
		texelsPerWorld: grassSpec.sampling.effectiveTexelsPerMeter,
		uvUnitsPerWorld: TERRAIN_UV_UNITS_PER_WORLD
	};
}

/** Accept decoded images only when their provenance passes the MitzvahWorld remote-material covenant. */
function remoteImage(image) {
	return isRealMaterialImage(image) ? image : null;
}

/** Resolve only genuine remote URLs; local paths never become production material authority. */
function remoteUrl(explicitUrl, image) {
	if (isRemoteMaterialUrl(explicitUrl)) return explicitUrl;
	const source = image?.currentSrc || image?.src || image?.dataset?.publicUrl || null;
	return isRemoteMaterialUrl(source) ? source : null;
}
