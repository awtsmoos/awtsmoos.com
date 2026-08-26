// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PrimitiveMaterialFactory.js
 * @description Binds canonical remote images, authored texture layers, and world-space mix law to generated primitives.
 * The Awtsmoos clothes each finite surface through one truthful vessel while Awtsmoos.com lets stone weather into stone and timber reveal grain;
 * authored strata remain sovereign, fallback recipes fill only silence, and every hydrated image still travels through the shared non-blocking chain.
 */

import { MeshStandardMaterial } from '../../../../light-three-gltf/tiny-runtime.js';
import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { isSameOriginMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';
import { scheduleLiveRealNatureBridge } from '../nature/LiveRealNatureScheduler.js';
import { colorArray } from './PrimitiveGeometryFactory.js';
import { withPrimitiveFallbackSurfaceRecipe } from './PrimitiveFallbackSurfaceRecipe.js';
import { createPrimitiveTexturePolicy } from './PrimitiveTexturePolicy.js';

scheduleImportedNatureBridge();

/**
 * Creates one standard material whose texture fields are ready for the tiny renderer's real GPU mix path.
 * @param {object} definition Procedural primitive definition.
 * @param {number} uvUnitsPerWorld Physical UV density supplied by geometry.
 * @returns {MeshStandardMaterial} Hydratable runtime material.
 */
export function createPrimitiveMaterial(definition, uvUnitsPerWorld) {
	const resolved = withPrimitiveFallbackSurfaceRecipe(definition);
	const textureUrl = textureUrlFor(resolved);
	const mapImage = resolved.mapImage || cachedTextureImage(textureUrl) || null;
	const mixImage = resolved.mixImage || cachedTextureImage(resolved.mixTextureUrl) || null;
	const material = new MeshStandardMaterial({
		alphaCutoff: resolved.alphaCutoff ?? 0.5,
		alphaMode: resolved.alphaMode || (resolved.transparent ? 'BLEND' : 'OPAQUE'),
		color: colorArray(resolved.color),
		doubleSided: Boolean(resolved.doubleSided),
		name: resolved.id,
		opacity: resolved.opacity ?? 1,
		transparent: Boolean(resolved.transparent)
	});
	Object.assign(material, materialFields(resolved, textureUrl, mapImage, mixImage, uvUnitsPerWorld));
	Object.assign(material, layeredFields(resolved));
	return material;
}

function materialFields(definition, textureUrl, mapImage, mixImage, uvUnitsPerWorld) {
	return {
		alphaCutoff: definition.alphaCutoff ?? 0.5,
		alphaMode: definition.alphaMode || (definition.transparent ? 'BLEND' : 'OPAQUE'),
		anisotropy: definition.anisotropy ?? 3,
		backfaceCull: definition.backfaceCull,
		emissiveStrength: definition.emissiveStrength ?? 1.8,
		mapImage,
		mapRepeat: definition.mapRepeat || [1, 1],
		mixImage,
		mixPatchScale: definition.mixPatchScale ?? 0,
		mixPatchSharpness: definition.mixPatchSharpness ?? 0.58,
		mixRepeat: definition.mixRepeat || definition.mapRepeat || [1, 1],
		mixStrength: definition.mixStrength ?? 0,
		mixTextureUrl: definition.mixTextureUrl || mixImage?.dataset?.publicUrl || null,
		normalTextureUrl: definition.normalTextureUrl || null,
		opacity: definition.opacity ?? 1,
		texturePolicy: materialPolicy(definition, textureUrl, mapImage, uvUnitsPerWorld),
		textureUrl,
		transparent: Boolean(definition.transparent)
	};
}

function layeredFields(definition) {
	if (!Array.isArray(definition.textureLayers) || !definition.textureLayers.length) {
		return {};
	}
	return {
		materialStack: definition.materialStack || null,
		textureLayers: definition.textureLayers.map(layer => ({
			...layer,
			image: layer.image || cachedTextureImage(layer.url) || null
		}))
	};
}

function materialPolicy(definition, textureUrl, mapImage, uvUnitsPerWorld) {
	return {
		...createPrimitiveTexturePolicy(definition, uvUnitsPerWorld),
		...(definition.texturePolicy || {}),
		fallbackApplied: Boolean(definition.texturePolicy?.fallbackSurfaceRecipe),
		publicFirebase: definition.texturePolicy?.publicFirebase ?? false,
		realMapImage: Boolean(mapImage),
		sameOrigin: isSameOriginMaterialUrl(textureUrl)
	};
}

function textureUrlFor(definition) {
	return definition.textureUrl
		|| definition.mapImage?.dataset?.publicUrl
		|| definition.mapImage?.dataset?.url
		|| definition.mapImage?.src
		|| null;
}

function scheduleImportedNatureBridge() {
	if (typeof document !== 'undefined') {
		scheduleLiveRealNatureBridge(globalThis);
	}
}
