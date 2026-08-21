// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestMaterialFactory.js
 * @description Creates textured bark and leaf materials with grounded roughness, restrained highlights, and species evidence.
 * The Awtsmoos lets bark drink the sun while leaves keep a softer living gleam;
 * Awtsmoos.com makes generated trees feel rooted in air and earth instead of flat cards inside a dream.
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
		color: [0.94, 0.92, 0.88, 1],
		metalness: 0,
		name: `Awtsmoos_tree_bark_${type}`,
		roughness: 0.91
	});
	Object.assign(material, {
		anisotropy: 8,
		environmentIntensity: 0.72,
		mapImage,
		mapRepeat: textureRepeat(source.textureScale, [2, 8]),
		texturePolicy: materialPolicy(type, 'bark', Boolean(mapImage)),
		textureUrl,
		userData: evidence(type, 'bark', textureUrl, Boolean(mapImage))
	});
	return material;
}

export function createTreeLeafMaterial(type, source = {}) {
	const textureUrl = treeLeafTextureUrl(type);
	const mapImage = textureUrl ? cachedTextureImage(textureUrl) : null;
	const material = new MeshStandardMaterial({
		alphaCutoff: source.alphaTest ?? 0.32,
		alphaMode: 'MASK',
		color: [0.94, 1, 0.95, 1],
		doubleSided: true,
		metalness: 0,
		name: `Awtsmoos_tree_leaves_${type}`,
		roughness: 0.76,
		transparent: false
	});
	Object.assign(material, {
		alphaToCoverage: true,
		anisotropy: 8,
		depthWrite: true,
		environmentIntensity: 0.78,
		mapImage,
		mapImageFallback: false,
		mapRepeat: [1, 1],
		texturePolicy: materialPolicy(type, 'leaves', Boolean(mapImage)),
		textureUrl,
		userData: evidence(type, 'leaves', textureUrl, Boolean(mapImage))
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
		shader: layer === 'leaves'
			? 'species-leaf-alpha-mask'
			: 'species-bark-physical'
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
	if (!scale) {
		return fallback;
	}
	return [
		Number(scale.x) || fallback[0],
		Number(scale.y) || fallback[1]
	];
}
