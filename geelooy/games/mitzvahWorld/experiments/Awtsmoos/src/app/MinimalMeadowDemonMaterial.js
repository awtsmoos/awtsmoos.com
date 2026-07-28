// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDemonMaterial.js
 * @description Binds patterned demon skin to a dark but measured mobile-readable material.
 * The Awtsmoos grants shadow no independent darkness; Awtsmoos.com keeps texture,
 * markings, silhouette, and profile distinction visible without turning demons into lamps.
 */

import { MeshStandardMaterial } from '../../../light-three-gltf/tiny-runtime.js';
import { minimalShadowHideTexture } from './MinimalMeadowCreatureTexture.js';
import {
	createDemonSurfaceDiagnostics
} from './MinimalMeadowDemonReadabilityMaterialRecord.js';
import {
	minimalDemonReadabilityProfile
} from './MinimalMeadowDemonReadabilityProfile.js';
import {
	DEFAULT_MINIMAL_DEMON_TINT,
	minimalDemonEmissiveColor,
	normalizeMinimalDemonTint
} from './MinimalMeadowDemonTintPolicy.js';

export const MINIMAL_DEMON_EMISSIVE_STRENGTH = 0.06;

export function createMinimalDemonMaterial(
	profile = {},
	documentValue = globalThis.document
) {
	const readability = minimalDemonReadabilityProfile(profile);
	const color = normalizeMinimalDemonTint(
		profile.tint || readability.tint,
		readability.tint
	);
	const mapImage = minimalShadowHideTexture(profile, documentValue);
	const material = new MeshStandardMaterial({
		color,
		doubleSided: true,
		name: `Awtsmoos_readable_shadow_skin_${profile.id || readability.id}`,
		opacity: color[3]
	});
	const diagnostics = createDemonSurfaceDiagnostics(
		readability,
		color,
		mapImage,
		MINIMAL_DEMON_EMISSIVE_STRENGTH
	);
	Object.assign(material, {
		anisotropy: 6,
		baseColorFactor: [...color],
		emissiveColor: minimalDemonEmissiveColor(color),
		emissiveStrength: MINIMAL_DEMON_EMISSIVE_STRENGTH,
		map: mapImage,
		mapImage,
		mapRepeat: [3.2, 2.55],
		metallicFactor: 0.035,
		metalness: 0.035,
		roughness: readability.roughness,
		roughnessFactor: readability.roughness,
		sourceColorSpace: 'procedural-srgb',
		surfaceDiagnostics: diagnostics,
		texturePolicy: texturePolicy(readability),
		vertexColors: true
	});
	material.userData = {
		bootstrapRendererRecord: diagnostics.bootstrapRenderer,
		richRendererRecord: diagnostics.richRenderer,
		surfaceDiagnostics: diagnostics
	};
	return material;
}

export { normalizeMinimalDemonTint } from './MinimalMeadowDemonTintPolicy.js';
export { DEFAULT_MINIMAL_DEMON_TINT };

function texturePolicy(readability) {
	return Object.freeze({
		closedSurface: true,
		practicalLightProxy: true,
		preserveAspect: true,
		role: 'demon-readable-hide',
		shader: 'canonical-continuous-skinned-demon',
		surfaceFamily: readability.name
	});
}
