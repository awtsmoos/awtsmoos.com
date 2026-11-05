//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file PrimitiveMaterialFactory.js
 * @description Resolves MitzvahWorld semantic surface evidence and delegates native material creation to Procedural Core.
 * Game code chooses trusted remote imagery and semantic texture policy; Core owns renderer-facing material vessels,
 * while generated or locally fabricated replacement imagery remains forbidden unless a future explicit Core API permits it.
 */
import { createNativeWorldMaterial } from '../../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { isSameOriginMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';
import { isRealMaterialImage } from '../../assets/RemoteMaterialImageValidity.js';
import { scheduleLiveRealNatureBridge } from '../nature/LiveRealNatureScheduler.js';
import { withPrimitiveFallbackSurfaceRecipe } from './PrimitiveFallbackSurfaceRecipe.js';
import { createPrimitiveTexturePolicy } from './PrimitiveTexturePolicy.js';

scheduleImportedNatureBridge();

/**
 * Resolve one game-specific surface recipe and ask Core to materialize its native renderer object.
 * @param {object} definition Semantic primitive material definition.
 * @param {number|number[]} uvUnitsPerWorld Physical UV density evidence from geometry preparation.
 * @returns {object} Core-created native material carrying MitzvahWorld's trusted semantic metadata.
 */
export function createPrimitiveMaterial(definition, uvUnitsPerWorld) {
	const resolved = withPrimitiveFallbackSurfaceRecipe(definition);
	const textureUrl = textureUrlFor(resolved);
	const mapImage = realImage(resolved.mapImage) || realImage(cachedTextureImage(textureUrl));
	const mixImage = realImage(resolved.mixImage) || realImage(cachedTextureImage(resolved.mixTextureUrl));	return createNativeWorldMaterial({
		alphaCutoff: resolved.alphaCutoff ?? 0.5,
		alphaMode: resolved.alphaMode || (resolved.transparent ? 'BLEND' : 'OPAQUE'),
		anisotropy: resolved.anisotropy ?? 3,
		backfaceCull: resolved.backfaceCull,
		color: resolved.color,
		doubleSided: Boolean(resolved.doubleSided),
		emissiveStrength: resolved.emissiveStrength ?? 1.8,
		mapImage,
		mapRepeat: resolved.mapRepeat || [1, 1],
		materialStack: resolved.materialStack || null,
		mixImage,
		mixPatchScale: resolved.mixPatchScale ?? 0,
		mixPatchSharpness: resolved.mixPatchSharpness ?? 0.58,
		mixRepeat: resolved.mixRepeat || resolved.mapRepeat || [1, 1],
		mixStrength: resolved.mixStrength ?? 0,
		mixTextureUrl: resolved.mixTextureUrl || null,
		name: resolved.id,
		normalTextureUrl: resolved.normalTextureUrl || null,
		opacity: resolved.opacity ?? 1,
		remoteOnly: true,
		textureLayers: resolvedTextureLayers(resolved),
		texturePolicy: materialPolicy(resolved, textureUrl, mapImage, uvUnitsPerWorld),
		textureUrl,
		transparent: Boolean(resolved.transparent)
	});
}

/** Preserve only layer images that pass the same remote provenance gate as the base material. */
function resolvedTextureLayers(definition) {
	if (!Array.isArray(definition.textureLayers) || !definition.textureLayers.length) return undefined;	return definition.textureLayers.map(layer => ({
		...layer,
		image: realImage(layer.image) || realImage(cachedTextureImage(layer.url))
	}));
}

/** Merge physical texture-density policy with MitzvahWorld's semantic remote provenance evidence. */
function materialPolicy(definition, textureUrl, mapImage, uvUnitsPerWorld) {
	return {
		...createPrimitiveTexturePolicy(definition, uvUnitsPerWorld),
		...(definition.texturePolicy || {}),
		publicFirebase: definition.texturePolicy?.publicFirebase ?? false,
		realMapImage: Boolean(mapImage),
		remoteOnly: true,
		sameOrigin: isSameOriginMaterialUrl(textureUrl)
	};
}

/** Select the explicit remote URL before consulting image metadata supplied by the loader. */
function textureUrlFor(definition) {
	return definition.textureUrl
		|| definition.mapImage?.dataset?.publicUrl
		|| definition.mapImage?.src
		|| null;
}

/** Accept only decoded images whose origin passed the shared MitzvahWorld remote-material gate. */
function realImage(image) {
	return isRealMaterialImage(image) ? image : null;
}

/** Wake browser-only nature hydration without making import-time Node tests depend on DOM globals. */
function scheduleImportedNatureBridge() {
	if (typeof document !== 'undefined') scheduleLiveRealNatureBridge(globalThis);
}
