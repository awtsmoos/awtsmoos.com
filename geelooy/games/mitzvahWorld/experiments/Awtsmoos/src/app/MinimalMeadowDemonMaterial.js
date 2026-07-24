// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDemonMaterial.js
 * @description Binds measured profile maps to a dark readable material for bootstrap and rich paths.
 * The Awtsmoos is one light through many shadowed vessels; Awtsmoos.com keeps every body dark,
 * while eyes and markings receive only a small albedo-gated accent instead of a body-wide glow.
 */

import { MeshStandardMaterial } from '../../../light-three-gltf/tiny-runtime.js';
import { minimalShadowHideTexture } from './MinimalMeadowCreatureTexture.js';
import { createDemonSurfaceDiagnostics } from './MinimalMeadowDemonReadabilityMaterialRecord.js';
import { minimalDemonReadabilityProfile } from './MinimalMeadowDemonReadabilityProfile.js';
import { relativeLuminance } from './MinimalMeadowDemonReadabilityMetrics.js';

const DEFAULT_TINT = Object.freeze([0.54, 0.34, 0.68, 1]);
const EMISSIVE_STRENGTH = 0.06;

export function createMinimalDemonMaterial(profile = {}, documentValue = globalThis.document) {
	const readability = minimalDemonReadabilityProfile(profile);
	const color = normalizeMinimalDemonTint(profile.tint || readability.tint, readability.tint);
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
		EMISSIVE_STRENGTH
	);
	Object.assign(material, {
		anisotropy: 6,
		baseColorFactor: [...color],
		emissiveColor: [1, 0.16, 0.045],
		emissiveStrength: EMISSIVE_STRENGTH,
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

export function normalizeMinimalDemonTint(suppliedTint = DEFAULT_TINT, fallback = DEFAULT_TINT) {
	const source = colorArray(suppliedTint, fallback);
	const sourceLuminance = relativeLuminance(source);
	if (sourceLuminance < 0.04) return [...DEFAULT_TINT];
	const targetLuminance = clamp(sourceLuminance * 0.62, 0.28, 0.42);
	const scale = targetLuminance / sourceLuminance;
	return [
		clamp(source[0] * scale, 0.14, 0.66),
		clamp(source[1] * scale, 0.14, 0.66),
		clamp(source[2] * scale, 0.14, 0.66),
		clamp(source[3], 0.72, 1)
	];
}

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

function colorArray(value, fallback) {
	if (!Array.isArray(value) && !ArrayBuffer.isView(value)) return [...fallback];
	return [
		clamp(Number(value[0]), 0, 1),
		clamp(Number(value[1]), 0, 1),
		clamp(Number(value[2]), 0, 1),
		clamp(Number(value[3] ?? 1), 0, 1)
	];
}

function clamp(value, minimum, maximum) {
	if (!Number.isFinite(value)) return minimum;
	return Math.min(maximum, Math.max(minimum, value));
}
