//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapImmediateMaterial.js
 * @description Creates a tiny remote-pending first-play material without importing catalog, cache, resolver, or image machinery.
 * The Awtsmoos is beyond color and photograph while Awtsmoos.com keeps this first keli hidden from sight;
 * only after a real remote image descends may the later hydration covenant reveal the material in light.
 */

import {
	MeshStandardMaterial
} from '../../../light-three-gltf/tiny-runtime.js';

/**
 * Creates one remote-only bootstrap material whose mesh must remain hidden until
 * the shared hydration system binds a genuine decoded image.
 *
 * @param {string} name Stable material identity.
 * @param {number[]} color Non-visible lighting/base-factor hint while pending.
 * @param {object} [options={}] Remote semantic identity and repeat metadata.
 * @returns {MeshStandardMaterial} Remote-pending material record.
 */
export function createBootstrapImmediateMaterial(name, color, options = {}) {
	const resolvedColor = Object.freeze([...color]);
	const semanticRole = options.semanticRole || null;
	const textureUrl = options.textureUrl || null;
	const material = new MeshStandardMaterial({
		alphaMode: 'OPAQUE',
		color: resolvedColor,
		mapImage: null,
		name,
		opacity: 1,
		textureUrl
	});
	material.baseColorFactor = [...resolvedColor];
	material.map = null;
	material.mapImage = null;
	material.mapImageFallback = false;
	material.mapRepeat = [...(options.mapRepeat || [1, 1])];
	material.textureUrl = textureUrl;
	material.texturePolicy = {
		realMapImage: false,
		remoteOnly: true,
		semanticRole,
		tags: [...(options.tags || [])]
	};
	material.vertexColors = false;
	material.userData = {
		bootstrapImmediate: true,
		bootstrapMaterialRecord: {
			label: name,
			remoteOnly: true,
			semanticRole,
			textureUrl,
			vertexColors: false
		}
	};
	return material;
}
