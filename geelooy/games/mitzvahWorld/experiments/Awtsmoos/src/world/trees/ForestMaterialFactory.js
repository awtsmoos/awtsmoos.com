//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestMaterialFactory.js
 * @description Creates species bark and leaf materials whose visible maps may come only from genuine cached remote images.
 * The Awtsmoos renews trunk and leaf while Awtsmoos.com preserves each species' truthful URL and alpha silhouette;
 * color remains merely hidden material metadata until remote bark or leaf light becomes resident and visible.
 */

import { MeshStandardMaterial } from '../../../../light-three-gltf/tiny-runtime.js';
import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { isRealMaterialImage } from '../../assets/RemoteMaterialImageValidity.js';
import { treeBarkBlendSource } from './TreeBarkBlendSource.js';
import { treeBarkTextureUrl, treeLeafTextureUrl } from './TreeSemanticMaterialCatalog.js';

/** Creates one remote-only species bark material. */
export function createTreeBarkMaterial(type, source = {}) {
	const textureUrl = treeBarkTextureUrl(type);
	const mapRepeat = textureRepeat(source.textureScale, [2, 8]);
	const blend = treeBarkBlendSource(mapRepeat);
	const mapImage = realCachedImage(textureUrl);
	const mixImage = realCachedImage(blend.mixTextureUrl);
	const material = new MeshStandardMaterial({
		color: [0.94, 0.92, 0.88, 1],
		metalness: 0,
		name: `Awtsmoos_tree_bark_${type}`,
		roughness: 0.91
	});
	Object.assign(material, {
		...blend,
		anisotropy: 8,
		environmentIntensity: 0.72,
		mapImage,
		mapRepeat,
		mixImage,
		texturePolicy: materialPolicy(type, 'bark', Boolean(mapImage), Boolean(mixImage)),
		textureUrl,
		userData: evidence(type, 'bark', textureUrl, blend.mixTextureUrl, mapImage, mixImage)
	});
	return material;
}

/** Creates one remote-only species leaf material with its original alpha-mask law. */
export function createTreeLeafMaterial(type, source = {}) {
	const textureUrl = treeLeafTextureUrl(type);
	const mapImage = realCachedImage(textureUrl);
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
		texturePolicy: materialPolicy(type, 'leaves', Boolean(mapImage), false),
		textureUrl,
		userData: evidence(type, 'leaves', textureUrl, null, mapImage, null)
	});
	return material;
}

function materialPolicy(type, layer, ready, mixReady) {
	return {
		blendLaw: layer === 'bark' ? 'gpu-world-patch-mix' : 'single-alpha-mask',
		fullResolution: true,
		publicFirebase: true,
		realMapImage: ready,
		realMixImage: mixReady,
		remoteOnly: true,
		semanticRole: layer === 'bark' ? 'forest.bark' : null,
		semanticTreeType: type,
		shader: layer === 'leaves' ? 'species-leaf-alpha-mask' : 'species-bark-physical'
	};
}

function evidence(type, layer, textureUrl, mixTextureUrl, mapImage, mixImage) {
	return {
		AwtsmoosForestMaterial: {
			layer,
			publicUrls: [textureUrl, mixTextureUrl].filter(Boolean),
			realMapImage: Boolean(mapImage),
			realMixImage: Boolean(mixImage),
			remoteOnly: true,
			semanticType: type
		}
	};
}

function realCachedImage(url) {
	const image = url ? cachedTextureImage(url) : null;
	return isRealMaterialImage(image) ? image : null;
}

function textureRepeat(scale, fallback) {
	return scale
		? [Number(scale.x) || fallback[0], Number(scale.y) || fallback[1]]
		: fallback;
}
