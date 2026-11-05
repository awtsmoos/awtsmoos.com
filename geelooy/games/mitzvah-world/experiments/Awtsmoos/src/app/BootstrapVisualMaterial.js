//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file BootstrapVisualMaterial.js
 * @description Resolves bootstrap semantic evidence while Procedural Core owns native material creation.
 * The bootstrap path may reuse a genuinely cached remote image, but never paints a placeholder; absent imagery stays
 * remote-pending while demon vertex modulation and semantic provenance remain available to hydration and diagnostics.
 */

import { createNativeWorldMaterial } from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import { cachedTextureImage } from '../assets/PublicMaterialCache.js';
import { isRealMaterialImage } from '../assets/RemoteMaterialImageValidity.js';
import { bootstrapMaterialEvidence } from './BootstrapMaterialTags.js';
import { normalizeMinimalDemonTint } from './MinimalMeadowDemonMaterial.js';
import { relativeLuminance } from './MinimalMeadowDemonReadabilityMetrics.js';

/** Creates one semantic bootstrap material with a verified cached map or a remote-pending null map. */
export function createBootstrapVisualMaterial(name, color, options = {}) {
	const demon = Boolean(options.demon || isDemonName(name));
	const resolvedColor = demon
		? normalizeMinimalDemonTint(options.profile?.tint || color)
		: [...color];
	const evidence = options.materialRole
		? bootstrapMaterialEvidence(options.materialRole)
		: null;
	const cached = evidence ? cachedTextureImage(evidence.primaryUrl) : null;
	const mapImage = isRealMaterialImage(cached) ? cached : null;
	const texturePolicy = remoteTexturePolicy(evidence, mapImage);
	const material = createNativeWorldMaterial({
		alphaMode: 'OPAQUE',
		color: resolvedColor,
		mapImage,
		mapImageFallback: false,
		mapRepeat: evidence?.repeat || [1, 1],
		name,
		opacity: 1,
		remoteOnly: true,
		semanticRole: evidence?.role || null,
		texturePolicy,
		textureUrl: evidence?.primaryUrl || null
	});
	material.baseColorFactor = [...resolvedColor];
	material.mapImageFallback = false;
	material.vertexColors = demon;
	material.userData = {
		bootstrapMaterialRecord: {
			baseColorLuminance: relativeLuminance(resolvedColor),
			demonReadabilityApplied: demon,
			formula: 'remote-map * optional-vertex-modulation',
			globalBrightening: false,
			label: evidence?.label || null,
			remoteOnly: true,
			semanticRole: evidence?.role || null,
			tags: evidence?.tags || [],
			textureUrl: evidence?.primaryUrl || null,
			vertexColors: demon
		},
		bootstrapVisual: true
	};
	return material;
}

function remoteTexturePolicy(evidence, mapImage) {
	return {
		realMapImage: Boolean(mapImage),
		remoteOnly: true,
		semanticRole: evidence?.role || null,
		tags: evidence?.tags || []
	};
}

function isDemonName(name) {
	return /(demon|shadow|tzel|esh-katan|ruach-afelah|shomer-hoshech|ketem-layla|ayin-raash)/i.test(name);
}
