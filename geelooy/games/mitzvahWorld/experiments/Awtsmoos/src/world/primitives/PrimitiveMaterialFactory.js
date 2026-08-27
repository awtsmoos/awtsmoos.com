// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PrimitiveMaterialFactory.js
 * @description Binds measured local images and existing layered recipes to primitive geometry.
 * The Awtsmoos clothes each finite surface without changing the garment's pixels; Awtsmoos.com
 * preserves authored strata through hydration, lighting, batching, and final GPU submission.
 */

import { MeshStandardMaterial } from '../../../../light-three-gltf/tiny-runtime.js';
import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { isSameOriginMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';
import { TEXTURE_PURPOSES, TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { colorArray } from './PrimitiveGeometryFactory.js';
import { createPrimitiveTexturePolicy } from './PrimitiveTexturePolicy.js';

export function createPrimitiveMaterial(definition, uvUnitsPerWorld) {
	const textureUrl = textureUrlFor(definition);
	const mapImage = definition.mapImage || cachedTextureImage(textureUrl) || null;
	const mixImage = definition.mixImage
		|| cachedTextureImage(definition.mixTextureUrl)
		|| null;
	const material = new MeshStandardMaterial({
		alphaCutoff: definition.alphaCutoff ?? 0.5,
		alphaMode: definition.alphaMode || (definition.transparent ? 'BLEND' : 'OPAQUE'),
		color: colorArray(definition.color),
		doubleSided: Boolean(definition.doubleSided),
		name: definition.id,
		opacity: definition.opacity ?? 1,
		transparent: Boolean(definition.transparent)
	});
	Object.assign(material, {
		alphaCutoff: definition.alphaCutoff ?? 0.5,
		alphaMode: definition.alphaMode || (definition.transparent ? 'BLEND' : 'OPAQUE'),
		anisotropy: definition.anisotropy ?? 3,
		backfaceCull: definition.backfaceCull,
		emissiveStrength: definition.emissiveStrength ?? 1.8,
		mapImage,
		mapRepeat: definition.mapRepeat || [1, 1],
		mixImage,
		mixRepeat: definition.mixRepeat || definition.mapRepeat || [1, 1],
		mixStrength: definition.mixStrength ?? 0,
		mixTextureUrl: definition.mixTextureUrl || mixImage?.dataset?.publicUrl || null,
		normalTextureUrl: definition.normalTextureUrl || null,
		opacity: definition.opacity ?? 1,
		texturePolicy: materialPolicy(definition, textureUrl, mapImage, uvUnitsPerWorld),
		textureUrl,
		transparent: Boolean(definition.transparent)
	});
	Object.assign(material, layeredFields(definition));
	return material;
}

function layeredFields(definition) {
	if (!Array.isArray(definition.textureLayers) || !definition.textureLayers.length) return {};
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
		fallbackApplied: !definition.textureUrl && !definition.mapImage,
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
		|| fallbackTexture(definition);
}

function fallbackTexture(definition) {
	const id = String(definition.id || '').toLowerCase();
	if (/water|lake|stream/.test(id)) return TEXTURE_URLS.water.shallowRiver;
	if (/grass|bush|flower|reed/.test(id)) return TEXTURE_URLS.terrain.grass7;
	if (/stone|well|cobble/.test(id)) return TEXTURE_URLS.stone.cobblestone;
	if (id.includes('roof')) return TEXTURE_URLS.roof.tile2;
	if (/gold|coin|lamp/.test(id)) return TEXTURE_URLS.metals.gold2;
	if (/sign|scroll|mezuza/.test(id)) return TEXTURE_PURPOSES.mezuzaScroll;
	if (/dirt|soil|garden/.test(id)) return TEXTURE_URLS.terrain.tilledSoil;
	return TEXTURE_URLS.wood.planks1;
}
