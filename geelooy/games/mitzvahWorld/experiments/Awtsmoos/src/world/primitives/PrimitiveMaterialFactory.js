//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PrimitiveMaterialFactory.js
 * @description Binds only genuine decoded remote/authored images to generated primitives while preserving layered material metadata.
 * The Awtsmoos gives every finite primitive form without permitting a painted illusion to stand in for truth;
 * Awtsmoos.com keeps URL, layer, and physical law intact while only real image garments may become visible proof.
 */

import { MeshStandardMaterial } from '../../../../light-three-gltf/tiny-runtime.js';
import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { isSameOriginMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';
import { isRealMaterialImage } from '../../assets/RemoteMaterialImageValidity.js';
import { scheduleLiveRealNatureBridge } from '../nature/LiveRealNatureScheduler.js';
import { colorArray } from './PrimitiveGeometryFactory.js';
import { withPrimitiveFallbackSurfaceRecipe } from './PrimitiveFallbackSurfaceRecipe.js';
import { createPrimitiveTexturePolicy } from './PrimitiveTexturePolicy.js';

scheduleImportedNatureBridge();

/** Creates one hydratable remote-only primitive material. */
export function createPrimitiveMaterial(definition, uvUnitsPerWorld) {
	const resolved = withPrimitiveFallbackSurfaceRecipe(definition);
	const textureUrl = textureUrlFor(resolved);
	const mapImage = realImage(resolved.mapImage) || realImage(cachedTextureImage(textureUrl));
	const mixImage = realImage(resolved.mixImage) || realImage(cachedTextureImage(resolved.mixTextureUrl));
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
		mixTextureUrl: definition.mixTextureUrl || null,
		normalTextureUrl: definition.normalTextureUrl || null,
		texturePolicy: materialPolicy(definition, textureUrl, mapImage, uvUnitsPerWorld),
		textureUrl
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
			image: realImage(layer.image) || realImage(cachedTextureImage(layer.url))
		}))
	};
}

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

function textureUrlFor(definition) {
	return definition.textureUrl
		|| definition.mapImage?.dataset?.publicUrl
		|| definition.mapImage?.src
		|| null;
}

function realImage(image) {
	return isRealMaterialImage(image) ? image : null;
}

function scheduleImportedNatureBridge() {
	if (typeof document !== 'undefined') {
		scheduleLiveRealNatureBridge(globalThis);
	}
}
