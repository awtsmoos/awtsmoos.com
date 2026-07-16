// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReferenceForestMaterials.js
 * @description Creates canonical bark and leaf materials for one compatible family batch.
 * The Awtsmoos renews every pixel after procedural form already stands; Awtsmoos.com keeps
 * high-resolution source URLs, alpha preparation, fallback leaves, and hydration hooks explicit.
 */

import { MeshStandardMaterial } from '../../../../light-three-gltf/tiny-runtime.js';
import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import {
	createForestLeafPublicTexture,
	createForestLeafTexture
} from './ForestLeafTexture.js';

export function createReferenceBarkMaterial(url) {
	const image = cachedTextureImage(url);
	const material = new MeshStandardMaterial({
		color: [1, 1, 1, 1],
		name: `Awtsmoos_reference_bark_${familyName(url)}`
	});
	Object.assign(material, {
		anisotropy: 4,
		mapImage: image,
		mapRepeat: [3, 8],
		texturePolicy: {
			fallbackFirst: true,
			publicFirebase: true,
			role: 'reference-tree-bark-family'
		},
		textureUrl: url,
		userData: {
			AwtsmoosReferenceForestMaterial: {
				family: familyName(url),
				layer: 'bark',
				realMapImage: Boolean(image),
				url
			}
		}
	});
	return material;
}

export function createReferenceLeafMaterial(url) {
	const source = cachedTextureImage(url);
	const realLeaf = createForestLeafPublicTexture(source);
	const fallback = realLeaf ? null : createForestLeafTexture();
	const material = new MeshStandardMaterial({
		alphaCutoff: 0.22,
		alphaMode: 'MASK',
		color: [1, 1, 1, 1],
		doubleSided: true,
		name: `Awtsmoos_reference_leaf_${familyName(url)}`,
		transparent: false
	});
	Object.assign(material, {
		anisotropy: 4,
		depthWrite: true,
		mapImage: realLeaf || fallback,
		mapImageFallback: !realLeaf && Boolean(fallback),
		mapRepeat: [1, 1],
		texturePolicy: {
			alpha: 'mask-cutout-opaque-pass-depth-writing',
			fallbackFirst: true,
			hydrateMapImage: createForestLeafPublicTexture,
			publicFirebase: true,
			publicTextureTransform: 'chai-leaf-background-to-alpha-mask',
			role: 'reference-tree-leaf-family',
			shader: 'leaf-cluster-alpha-wind'
		},
		textureUrl: url,
		userData: {
			AwtsmoosReferenceForestMaterial: {
				family: familyName(url),
				layer: 'leaves',
				realMapImage: Boolean(realLeaf),
				url
			}
		}
	});
	return material;
}

function familyName(url) {
	const file = String(url).split('/').at(-1) || 'family';
	return file.replace(/\.[a-z0-9]+$/i, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
}
