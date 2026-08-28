//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainMaterialFactory.js
 * @description Builds remote-only alpine terrain while preserving constructor-time remote imagery and ecological mixing metadata.
 * The Awtsmoos renews earth beneath every foot beyond photograph and pigment; Awtsmoos.com lets true distant grass shine neutral,
 * while an unhydrated valley stays concealed until the remote image arrives and fills the material vessel actual.
 */

import { MeshStandardMaterial } from '../../../../light-three-gltf/tiny-runtime.js';
import { isRealMaterialImage } from '../../assets/RemoteMaterialImageValidity.js';
import { isRemoteMaterialUrl } from '../../assets/PublicMaterialRemoteProvenance.js';
import { mainRiverVillageSurfaceMix } from '../materials/MainRiverVillageSurfaceMix.js';
import { materialStackDiagnostics } from '../materials/MaterialStackRecipe.js';
import { terrainLayerRecipe } from './TerrainLayerRecipe.js';
import { terrainRealismProfile } from './TerrainRealismProfile.js';

const TERRAIN_NEUTRAL_TINT = Object.freeze([1, 1, 1, 1]);
const TERRAIN_UV_UNITS_PER_WORLD = Object.freeze([0.035, 0.035]);
export const TERRAIN_CINEMATIC_MIX_STRENGTH = 0;
export const TERRAIN_CINEMATIC_PATCH_SCALE = 0.024;

/** Creates one terrain material whose immediate maps qualify only with real remote provenance. */
export function createTerrainMaterial(options = {}) {
	const quality = options.quality || 'medium';
	const recipe = terrainLayerRecipe(quality);
	const realism = terrainRealismProfile(quality);
	const surfaceMix = mainRiverVillageSurfaceMix(recipe.layers, quality);
	const mapImage = remoteImage(options.grassImage);
	const mixImage = remoteImage(options.dirtImage);
	const textureUrl = remoteUrl(options.fallbackUrl, mapImage);
	const mixTextureUrl = remoteUrl(null, mixImage);
	const material = new MeshStandardMaterial({
		color: TERRAIN_NEUTRAL_TINT,
		metalness: 0,
		name: 'Awtsmoos_canonical_remote_alpine_valley',
		roughness: 0.92
	});
	Object.assign(material, terrainFields(recipe, realism, surfaceMix, mapImage, mixImage, textureUrl, mixTextureUrl));
	return material;
}

function terrainFields(recipe, realism, surfaceMix, mapImage, mixImage, textureUrl, mixTextureUrl) {
	return {
		anisotropy: false,
		mapImage,
		mapRepeat: [10, 10],
		materialStack: recipe.stack,
		mixImage,
		mixPatchScale: TERRAIN_CINEMATIC_PATCH_SCALE,
		mixPatchSharpness: 0.74,
		mixRepeat: [1, 1],
		mixStrength: TERRAIN_CINEMATIC_MIX_STRENGTH,
		mixTextureUrl,
		opacity: 1,
		terrainMixingA: realism.a,
		terrainMixingB: realism.b,
		terrainMixingC: realism.c,
		textureLayers: [...surfaceMix.layers],
		texturePolicy: terrainPolicy(recipe, realism, surfaceMix, mapImage, mixImage),
		textureUrl,
		transparent: false
	};
}

function terrainPolicy(recipe, realism, surfaceMix, mapImage, mixImage) {
	return {
		baseSource: mapImage ? 'verified-remote-image-at-construction' : 'remote-only-semantic-terrain',
		fullResolutionEcologicalLayers: true,
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
		texelsPerWorld: 0,
		uvUnitsPerWorld: TERRAIN_UV_UNITS_PER_WORLD
	};
}

function remoteImage(image) {
	return isRealMaterialImage(image) ? image : null;
}

function remoteUrl(explicitUrl, image) {
	if (isRemoteMaterialUrl(explicitUrl)) {
		return explicitUrl;
	}
	const source = image?.currentSrc || image?.src || image?.dataset?.publicUrl || null;
	return isRemoteMaterialUrl(source) ? source : null;
}
