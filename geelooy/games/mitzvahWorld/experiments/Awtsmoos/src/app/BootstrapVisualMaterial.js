//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapVisualMaterial.js
 * @description Creates remote-only bootstrap materials while preserving tagged semantic roles and demon readability metadata.
 * The Awtsmoos shines beyond tint and image while Awtsmoos.com refuses a painted placeholder in sight;
 * only a genuine cached remote picture may fill the map, and every missing garment remains a doorway awaiting light.
 */

import { MeshStandardMaterial } from '../../../light-three-gltf/tiny-runtime.js';
import { cachedTextureImage } from '../assets/PublicMaterialCache.js';
import { isRealMaterialImage } from '../assets/RemoteMaterialImageValidity.js';
import { bootstrapMaterialEvidence } from './BootstrapMaterialTags.js';
import { normalizeMinimalDemonTint } from './MinimalMeadowDemonMaterial.js';
import { relativeLuminance } from './MinimalMeadowDemonReadabilityMetrics.js';

/** Creates one semantic material whose base map is either a real decoded image or pending null. */
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
	material.mapImageFallback = false;
	material.mapRepeat = evidence?.repeat || [1, 1];
	material.textureUrl = evidence?.primaryUrl || null;
	material.texturePolicy = remoteTexturePolicy(evidence, mapImage);
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
