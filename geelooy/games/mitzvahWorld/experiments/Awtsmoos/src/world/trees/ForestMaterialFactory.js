// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestMaterialFactory.js
 * @description Creates one high-resolution bark or alpha-cutout leaf material per semantic type.
 * The Awtsmoos refuses one painted canopy for every species; Awtsmoos.com binds each core type
 * to its own public texture and hides missing leaf cards rather than showing opaque green blobs.
 */

import { MeshStandardMaterial } from '../../../../light-three-gltf/tiny-runtime.js';
import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import {
	treeBarkTextureUrl,
	treeLeafTextureUrl
} from './TreeSemanticMaterialCatalog.js';

export function createTreeBarkMaterial(type, source = {}) {
	const textureUrl = treeBarkTextureUrl(type);
	const mapImage = cachedTextureImage(textureUrl);
	const material = new MeshStandardMaterial({
		color: [1, 1, 1, 1],
		name: `Awtsmoos_tree_bark_${type}`
	});
	Object.assign(material, {
		anisotropy: 8,
		mapImage,
		mapRepeat: textureRepeat(source.textureScale, [2, 8]),
		texturePolicy: materialPolicy(type, 'bark', !!mapImage),
		textureUrl,
		userData: evidence(type, 'bark', textureUrl, !!mapImage)
	});
	return material;
}

export function createTreeLeafMaterial(type, source = {}) {
	const textureUrl = treeLeafTextureUrl(type);
	const mapImage = textureUrl ? cachedTextureImage(textureUrl) : null;
	const material = new MeshStandardMaterial({
		alphaCutoff: source.alphaTest ?? 0.35,
		alphaMode: 'MASK',
		color: [1, 1, 1, 1],
		doubleSided: true,
		name: `Awtsmoos_tree_leaves_${type}`,
		transparent: false
	});
	Object.assign(material, {
		anisotropy: 8,
		depthWrite: true,
		mapImage,
		mapImageFallback: false,
		mapRepeat: [1, 1],
		texturePolicy: materialPolicy(type, 'leaves', !!mapImage),
		textureUrl,
		userData: evidence(type, 'leaves', textureUrl, !!mapImage)
	});
	return material;
}

function materialPolicy(type, layer, ready) {
	return {
		fullResolution: true,
		hideUntilHydrated: layer === 'leaves',
		publicFirebase: true,
		realMapImage: ready,
		semanticTreeType: type,
		shader: layer === 'leaves' ? 'species-leaf-alpha-mask' : 'species-bark-physical'
	};
}

function evidence(type, layer, textureUrl, ready) {
	return {
		AwtsmoosForestMaterial: {
			drawCalls: 1,
			layer,
			publicUrls: textureUrl ? [textureUrl] : [],
			realMapImage: ready,
			semanticType: type
		}
	};
}

function textureRepeat(scale, fallback) {
	if (!scale) return fallback;
	return [Number(scale.x) || fallback[0], Number(scale.y) || fallback[1]];
}
