// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MinimalMeadowDemonMaterial.js
	* @description Creates independent demon materials over shared procedural hide resources.
	* The Awtsmoos is one light through many finite vessels; Awtsmoos.com shares costly texture
	* memory while every actor keeps its own color, selection feedback, damage flash, and identity.
	*/

import { MeshStandardMaterial } from '../../../light-three-gltf/tiny-runtime.js';
import {
	minimalShadowHideTexture,
	minimalShadowSurfaceFamily
} from './MinimalMeadowCreatureTexture.js';

const DEFAULT_TINT = Object.freeze([0.54, 0.34, 0.68, 1]);

/**
	* Creates one material per actor without allocating anything during animation frames.
	* @param {object} profile Profile tint, identity, and optional controlled surface family.
	* @param {Document} documentValue Browser document or injected test vessel.
	* @returns {MeshStandardMaterial} Independently mutable renderer-native material.
	*/
export function createMinimalDemonMaterial(profile = {}, documentValue = globalThis.document) {
	const family = minimalShadowSurfaceFamily(profile);
	const color = normalizeMinimalDemonTint(profile.tint);
	const mapImage = minimalShadowHideTexture(profile, documentValue);
	const material = new MeshStandardMaterial({
		color,
		doubleSided: true,
		name: `Awtsmoos_continuous_skin_${profile.id || family.name}`,
		opacity: color[3]
	});
	const diagnostics = Object.freeze({
		anisotropy: 6,
		baseColor: Object.freeze([...color]),
		family: family.name,
		mapRepeat: Object.freeze([3.2, 2.55]),
		metallicFactor: 0.035,
		roughnessFactor: 0.78,
		sourceDimensions: Object.freeze([
			mapImage?.naturalWidth || mapImage?.width || 0,
			mapImage?.naturalHeight || mapImage?.height || 0
		])
	});
	Object.assign(material, {
		anisotropy: diagnostics.anisotropy,
		baseColorFactor: color,
		emissiveColor: [color[0] * 0.18, color[1] * 0.12, color[2] * 0.22],
		emissiveStrength: 0.24,
		mapImage,
		mapRepeat: [...diagnostics.mapRepeat],
		metallicFactor: diagnostics.metallicFactor,
		metalness: diagnostics.metallicFactor,
		roughness: diagnostics.roughnessFactor,
		roughnessFactor: diagnostics.roughnessFactor,
		sourceColorSpace: 'procedural-srgb',
		surfaceDiagnostics: diagnostics,
		texturePolicy: Object.freeze({
			closedSurface: true,
			preserveAspect: true,
			role: 'demon-readable-hide',
			shader: 'canonical-continuous-skinned-demon',
			surfaceFamily: family.name
		}),
		vertexColors: true
	});
	return material;
}

/**
	* Lifts black profiles into daylight readability while preserving dark hue relationships.
	* @param {ArrayLike<number>} suppliedTint Source RGBA values.
	* @returns {number[]} Dark, readable, non-white RGBA color.
	*/
export function normalizeMinimalDemonTint(suppliedTint = DEFAULT_TINT) {
	const source = colorArray(suppliedTint);
	const luminance = source[0] * 0.2126 + source[1] * 0.7152 + source[2] * 0.0722;
	if (luminance < 0.04) {
		return [...DEFAULT_TINT];
	}
	const target = clamp(luminance * 0.62, 0.24, 0.36);
	const scale = target / luminance;
	return [
		clamp(source[0] * scale, 0.16, 0.62),
		clamp(source[1] * scale, 0.14, 0.58),
		clamp(source[2] * scale, 0.18, 0.66),
		clamp(source[3], 0.55, 1)
	];
}

function colorArray(value) {
	if (!Array.isArray(value) && !ArrayBuffer.isView(value)) {
		return [...DEFAULT_TINT];
	}
	return [
		clamp(Number(value[0]), 0, 1),
		clamp(Number(value[1]), 0, 1),
		clamp(Number(value[2]), 0, 1),
		clamp(Number(value[3] ?? 1), 0, 1)
	];
}

function clamp(value, minimum, maximum) {
	if (!Number.isFinite(value)) {
		return minimum;
	}
	return Math.min(maximum, Math.max(minimum, value));
}
