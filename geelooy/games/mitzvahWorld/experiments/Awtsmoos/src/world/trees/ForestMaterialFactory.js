// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestMaterialFactory.js
 * @description Creates species-true bark with subtle Chai weather blending while leaves retain exact alpha-mask silhouettes.
 * The Awtsmoos lets each tree keep its species name while another bark memory crosses the trunk in measured patches of light;
 * Awtsmoos.com uses two real remote samplers only for bark, preserving leaf cutouts, shared cache truth, and grounded mobile sight.
 */

import { MeshStandardMaterial } from '../../../../light-three-gltf/tiny-runtime.js';
import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { treeBarkBlendSource } from './TreeBarkBlendSource.js';
import {
	treeBarkTextureUrl,
	treeLeafTextureUrl
} from './TreeSemanticMaterialCatalog.js';

/** Creates one species bark material with a subtle second remote bark source. */
export function createTreeBarkMaterial(type, source = {}) {
	const textureUrl = treeBarkTextureUrl(type);
	const mapRepeat = textureRepeat(source.textureScale, [2, 8]);
	const blend = treeBarkBlendSource(mapRepeat);
	const mapImage = cachedTextureImage(textureUrl);
	const mixImage = blend.mixTextureUrl ? cachedTextureImage(blend.mixTextureUrl) : null;
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

/** Creates one species leaf material whose alpha silhouette remains unmixed. */
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
		mixImage: null,
		mixStrength: 0,
		mixTextureUrl: null,
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
		hideUntilHydrated: layer === 'leaves',
		publicFirebase: true,
		realMapImage: ready,
		realMixImage: mixReady,
		samplersPerSurface: layer === 'bark' ? 2 : 1,
		semanticTreeType: type,
		shader: layer === 'leaves' ? 'species-leaf-alpha-mask' : 'species-bark-physical'
	};
}

function evidence(type, layer, textureUrl, mixTextureUrl, mapImage, mixImage) {
	return {
		AwtsmoosForestMaterial: {
			drawCalls: 1,
			layer,
			publicUrls: [textureUrl, mixTextureUrl].filter(Boolean),
			realMapImage: Boolean(mapImage),
			realMixImage: Boolean(mixImage),
			semanticType: type
		}
	};
}

function textureRepeat(scale, fallback) {
	if (!scale) {
		return fallback;
	}
	return [Number(scale.x) || fallback[0], Number(scale.y) || fallback[1]];
}
