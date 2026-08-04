// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapVisualMaterial.js
 * @description Creates immediate colored materials that already name their tagged real texture role.
 * The Awtsmoos keeps a hue visible before the distant image enters sight;
 * Awtsmoos.com binds cached truth when present and leaves an auditable doorway for later light.
 */

import { MeshStandardMaterial } from '../../../light-three-gltf/tiny-runtime.js';
import { cachedTextureImage } from '../assets/PublicMaterialCache.js';
import { bootstrapMaterialEvidence } from './BootstrapMaterialTags.js';
import { normalizeMinimalDemonTint } from './MinimalMeadowDemonMaterial.js';
import { relativeLuminance } from './MinimalMeadowDemonReadabilityMetrics.js';

export function createBootstrapVisualMaterial(name, color, options = {}) {
	const demon = Boolean(options.demon || isDemonName(name));
	const resolvedColor = demon
		? normalizeMinimalDemonTint(options.profile?.tint || color)
		: [...color];
	const evidence = options.materialRole
		? bootstrapMaterialEvidence(options.materialRole)
		: null;
	const mapImage = evidence ? cachedTextureImage(evidence.primaryUrl) : null;
	const material = new MeshStandardMaterial({
		alphaMode: 'OPAQUE',
		color: Object.freeze(resolvedColor),
		mapImage,
		name,
		opacity: 1,
		textureUrl: evidence?.primaryUrl || null
	});
	material.baseColorFactor = [...resolvedColor];
	material.mapImage = mapImage;
	material.mapImageFallback = !mapImage;
	material.mapRepeat = evidence?.repeat || [1, 1];
	material.textureUrl = evidence?.primaryUrl || null;
	material.texturePolicy = texturePolicy(evidence, mapImage);
	material.vertexColors = demon;
	material.userData = {
		bootstrapMaterialRecord: {
			baseColorLuminance: relativeLuminance(resolvedColor),
			demonReadabilityApplied: demon,
			formula: 'uColor * vColor',
			globalBrightening: false,
			label: evidence?.label || null,
			semanticRole: evidence?.role || null,
			tags: evidence?.tags || [],
			textureUrl: evidence?.primaryUrl || null,
			vertexColors: demon
		},
		bootstrapVisual: true
	};
	return material;
}

function texturePolicy(evidence, mapImage) {
	return {
		proceduralFallbackActive: Boolean(evidence && !mapImage),
		realMapImage: Boolean(mapImage),
		semanticRole: evidence?.role || null,
		tags: evidence?.tags || []
	};
}

function isDemonName(name) {
	return /(demon|shadow|tzel|esh-katan|ruach-afelah|shomer-hoshech|ketem-layla|ayin-raash)/i.test(name);
}
