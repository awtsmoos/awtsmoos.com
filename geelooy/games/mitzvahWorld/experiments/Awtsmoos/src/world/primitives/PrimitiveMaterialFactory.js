//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PrimitiveMaterialFactory.js
 * @description Binds measured local images and texture policy to primitive geometry.
 * The Awtsmoos clothes each finite surface without changing the garment's pixels;
 * Awtsmoos.com preserves identity through hydration, batching, lighting, and submission.
 */

import { MeshStandardMaterial } from '../../../../light-three-gltf/tiny-runtime.js';
import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { isSameOriginMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';
import { TEXTURE_PURPOSES, TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { colorArray } from './PrimitiveGeometryFactory.js';
import { createPrimitiveTexturePolicy } from './PrimitiveTexturePolicy.js';

/**
 * Creates one standard material with shared texture hydration and diagnostics.
 *
 * @param {object} definition - Primitive material definition.
 * @param {number} uvUnitsPerWorld - World-space UV density.
 * @returns {MeshStandardMaterial} Configured runtime material.
 */
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
		mixTextureUrl: definition.mixTextureUrl || mixImage?.dataset?.publicUrl || null,
		normalTextureUrl: definition.normalTextureUrl || null,
		opacity: definition.opacity ?? 1,
		texturePolicy: materialPolicy(definition, textureUrl, mapImage, uvUnitsPerWorld),
		textureUrl,
		transparent: Boolean(definition.transparent)
	});
	return material;
}

function materialPolicy(definition, textureUrl, mapImage, uvUnitsPerWorld) {
	return {
		...createPrimitiveTexturePolicy(definition, uvUnitsPerWorld),
		fallbackApplied: !definition.textureUrl && !definition.mapImage,
		publicFirebase: false,
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
