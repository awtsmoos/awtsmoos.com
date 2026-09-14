//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file ForestMaterialFactory.js
 * @description Resolves species-specific remote bark and leaf evidence while Core alone creates renderer-facing native materials.
 * RESPONSIBILITY: choose trusted semantic URLs, cached real images, authored alpha law, bark weathering mix, and forest diagnostics.
 * NON-RESPONSIBILITY: this game module never constructs MeshStandardMaterial, paints textures, or invents fallback foliage imagery.
 * HYDRATION: materials remain remote-only and advertise their sampler/readiness contract to the shared scene hydration system.
 */

import {
	createNativeWorldMaterial
} from '../../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { isRealMaterialImage } from '../../assets/RemoteMaterialImageValidity.js';
import { treeBarkBlendSource } from './TreeBarkBlendSource.js';
import { treeBarkTextureUrl, treeLeafTextureUrl } from './TreeSemanticMaterialCatalog.js';

/**
 * Create one remote-only species bark material through Core's native material boundary.
 * @param {string} type Stable procedural tree bark semantic identity.
 * @param {object} source Optional generated material scale metadata.
 * @returns {object} Core-owned native material with two-source bark weathering evidence.
 */
export function createTreeBarkMaterial(type, source = {}) {
	const textureUrl = treeBarkTextureUrl(type);
	const mapRepeat = textureRepeat(source.textureScale, [2, 8]);
	const blend = treeBarkBlendSource(mapRepeat);
	const mapImage = realCachedImage(textureUrl);
	const mixImage = realCachedImage(blend.mixTextureUrl);
	return createNativeWorldMaterial({
		...blend,
		anisotropy: 8,
		color: [0.94, 0.92, 0.88, 1],
		environmentIntensity: 0.72,
		mapImage,
		mapRepeat,
		metalness: 0,
		mixImage,
		name: `Awtsmoos_tree_bark_${type}`,
		roughness: 0.91,
		texturePolicy: materialPolicy(type, 'bark', mapImage, mixImage),
		textureUrl,
		userData: evidence(type, 'bark', textureUrl, blend.mixTextureUrl, mapImage, mixImage)
	});
}

/**
 * Create one remote-only species leaf material preserving the source image's authored alpha silhouette.
 * @param {string} type Stable procedural tree leaf semantic identity.
 * @param {object} source Optional alpha-test metadata from the generator.
 * @returns {object} Core-owned alpha-masked native material with no local image fallback.
 */
export function createTreeLeafMaterial(type, source = {}) {
	const textureUrl = treeLeafTextureUrl(type);
	const mapImage = realCachedImage(textureUrl);
	return createNativeWorldMaterial({
		alphaCutoff: source.alphaTest ?? 0.32,
		alphaMode: 'MASK',
		alphaToCoverage: true,
		anisotropy: 8,
		color: [0.94, 1, 0.95, 1],
		depthWrite: true,
		doubleSided: true,
		environmentIntensity: 0.78,
		mapImage,
		mapImageFallback: false,
		mapRepeat: [1, 1],
		metalness: 0,
		name: `Awtsmoos_tree_leaves_${type}`,
		roughness: 0.76,
		texturePolicy: materialPolicy(type, 'leaves', mapImage, null),
		textureUrl,
		transparent: false,
		userData: evidence(type, 'leaves', textureUrl, null, mapImage, null)
	});
}

/** Publish immutable remote/readiness semantics consumed by diagnostics, hydration, and renderer policy. */
function materialPolicy(type, layer, mapImage, mixImage) {
	return {
		blendLaw: layer === 'bark' ? 'gpu-world-patch-mix' : 'single-alpha-mask',
		fullResolution: true,
		hideUntilHydrated: true,
		publicFirebase: true,
		realMapImage: Boolean(mapImage),
		realMixImage: Boolean(mixImage),
		remoteOnly: true,
		samplersPerSurface: layer === 'bark' ? 2 : 1,
		semanticRole: layer === 'bark' ? 'forest.bark' : 'forest.leaves',
		semanticTreeType: type,
		shader: layer === 'leaves' ? 'species-leaf-alpha-mask' : 'species-bark-physical'
	};
}

/** Preserve source identity and hydration evidence without duplicating renderer state. */
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
	return scale ? [Number(scale.x) || fallback[0], Number(scale.y) || fallback[1]] : fallback;
}
