//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file BootstrapImmediateMaterial.js
 * @description Creates a tiny remote-pending first-play material through Procedural Core.
 * Bootstrap code supplies semantic identity only; Core owns the native physical material while the shared hydration
 * system keeps the surface hidden until a verified remote image exists. No local/generated image substitute is made.
 */

import {
	createNativeWorldMaterial
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';

/**
 * Creates one remote-only bootstrap material whose mesh remains pending until hydration.
 * Pass options.mapImage with a generated texture field ({width,height,data}) to bind
 * procedural pixels immediately; the remote upgrade path stays untouched.
 * @param {string} name Stable material identity.
 * @param {number[]} color Non-visible base-factor hint while pending.
 * @param {object} [options={}] Semantic role, repeat, tags, mapImage, and optional trusted URL.
 * @returns {object} Core-owned native remote-pending material.
 */
export function createBootstrapImmediateMaterial(name, color, options = {}) {
	const resolvedColor = Object.freeze([...color]);
	const semanticRole = options.semanticRole || null;
	const textureUrl = options.textureUrl || null;
	const mapRepeat = [...(options.mapRepeat || [1, 1])];
	const mapImage = options.mapImage || null;
	const material = createNativeWorldMaterial({
		alphaMode: 'OPAQUE',
		color: resolvedColor,
		mapImage,
		mapImageFallback: false,
		mapRepeat,
		name,
		opacity: 1,
		remoteOnly: true,
		semanticRole,
		texturePolicy: { tags: [...(options.tags || [])] },
		textureUrl
	});
	material.baseColorFactor = [...resolvedColor];
	material.map = null;
	material.mapImage = mapImage;
	material.mapImageFallback = false;
	material.mapRepeat = mapRepeat;
	material.textureUrl = textureUrl;
	material.vertexColors = false;
	material.userData = {
		bootstrapImmediate: true,
		bootstrapMaterialRecord: {
			label: name,
			mapImageBound: Boolean(mapImage),
			remoteOnly: true,
			semanticRole,
			textureUrl,
			vertexColors: false
		}
	};
	return material;
}
