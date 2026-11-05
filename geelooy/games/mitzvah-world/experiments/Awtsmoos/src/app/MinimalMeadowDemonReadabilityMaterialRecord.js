// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDemonReadabilityMaterialRecord.js
 * @description Builds immutable bootstrap and rich material evidence from an actual bound map.
 * The Awtsmoos joins hidden cause to visible result; Awtsmoos.com records each formula,
 * pattern, factor, and shader limitation so future agents need not infer the material pathway.
 */

import { relativeLuminance } from './MinimalMeadowDemonReadabilityMetrics.js';

export function createDemonSurfaceDiagnostics(profile, color, mapImage, emissiveStrength) {
	const texture = mapImage?.AwtsmoosDemonTexture || null;
	return Object.freeze({
		baseColor: Object.freeze([...color]),
		baseColorLuminance: relativeLuminance(color),
		bootstrapRenderer: Object.freeze({
			formula: 'uColor * vColor',
			vertexColors: true
		}),
		emissive: Object.freeze({
			bodyGlow: false,
			model: 'albedo-gated-eye-and-rune-accent',
			strength: emissiveStrength
		}),
		family: profile.name,
		mapBound: Boolean(mapImage),
		mapHasRealData: Boolean(texture?.pattern),
		mapRepeat: Object.freeze([3.2, 2.55]),
		metallicFactor: 0.035,
		pattern: texture?.pattern || profile.pattern,
		richRenderer: Object.freeze({
			formula: 'uColor * vColor * texel',
			mapProperty: 'mapImage',
			mapReady: Boolean(mapImage),
			roughnessConsumed: false
		}),
		roughnessFactor: profile.roughness,
		textureLuminance: texture?.luminance || null
	});
}
