//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDemonMaterial.js
 * @description Defines remote-only demon surface physics while retaining anatomical vertex modulation beneath the eventual fur map.
 * The Awtsmoos grants shadow no independent darkness; Awtsmoos.com keeps the demon unseen until real remote hide arrives,
 * yet once clothed, finite vertex variation may deepen anatomy without ever becoming a naked solid-color disguise.
 */

import { MeshStandardMaterial } from '../../../light-three-gltf/tiny-runtime.js';
import { createDemonSurfaceDiagnostics } from './MinimalMeadowDemonReadabilityMaterialRecord.js';
import { minimalDemonReadabilityProfile } from './MinimalMeadowDemonReadabilityProfile.js';
import {
	DEFAULT_MINIMAL_DEMON_TINT,
	minimalDemonEmissiveColor,
	normalizeMinimalDemonTint
} from './MinimalMeadowDemonTintPolicy.js';

export const MINIMAL_DEMON_EMISSIVE_STRENGTH = 0.06;

/** Creates a remote-pending fur material whose vertex colors only modulate a qualified remote map. */
export function createMinimalDemonMaterial(profile = {}) {
	const readability = minimalDemonReadabilityProfile(profile);
	const color = normalizeMinimalDemonTint(profile.tint || readability.tint, readability.tint);
	const material = new MeshStandardMaterial({
		color,
		doubleSided: true,
		name: `Awtsmoos_remote_shadow_skin_${profile.id || readability.id}`,
		opacity: color[3]
	});
	const diagnostics = createDemonSurfaceDiagnostics(readability, color, null, MINIMAL_DEMON_EMISSIVE_STRENGTH);
	Object.assign(material, {
		anisotropy: 6,
		baseColorFactor: [...color],
		emissiveColor: minimalDemonEmissiveColor(color),
		emissiveStrength: MINIMAL_DEMON_EMISSIVE_STRENGTH,
		map: null,
		mapImage: null,
		mapRepeat: [3.2, 2.55],
		metallicFactor: 0.035,
		metalness: 0.035,
		roughness: readability.roughness,
		roughnessFactor: readability.roughness,
		surfaceDiagnostics: diagnostics,
		texturePolicy: texturePolicy(readability),
		vertexColors: true
	});
	material.userData = {
		bootstrapRendererRecord: diagnostics.bootstrapRenderer,
		remoteOnly: true,
		richRendererRecord: diagnostics.richRenderer,
		surfaceDiagnostics: diagnostics,
		vertexColorRole: 'remote-map-modulation-only'
	};
	return material;
}

export { normalizeMinimalDemonTint } from './MinimalMeadowDemonTintPolicy.js';
export { DEFAULT_MINIMAL_DEMON_TINT };

function texturePolicy(readability) {
	return {
		closedSurface: true,
		practicalLightProxy: true,
		preserveAspect: true,
		realMapImage: false,
		remoteOnly: true,
		semanticRole: 'creature.fur',
		shader: 'canonical-continuous-skinned-demon',
		surfaceFamily: readability.name,
		vertexColorModulation: true
	};
}
