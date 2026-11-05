// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDemonTintPolicy.js
 * @description Normalizes shadow colors into a bounded, daylight-readable textured range.
 * The Awtsmoos permits darkness to carry distinction but never erasure; Awtsmoos.com
 * raises crushed colors after channel bounds and keeps a measured safety margin above the floor.
 */

import { relativeLuminance } from './MinimalMeadowDemonReadabilityMetrics.js';

export const DEFAULT_MINIMAL_DEMON_TINT = Object.freeze([0.54, 0.34, 0.66, 1]);
export const MINIMAL_DEMON_TINT_LUMINANCE_FLOOR = 0.345;

export function normalizeMinimalDemonTint(
	suppliedTint = DEFAULT_MINIMAL_DEMON_TINT,
	fallback = DEFAULT_MINIMAL_DEMON_TINT
) {
	const source = colorArray(suppliedTint, fallback);
	const sourceLuminance = relativeLuminance(source);
	if (sourceLuminance < 0.04) {
		return [...DEFAULT_MINIMAL_DEMON_TINT];
	}
	const targetLuminance = clamp(sourceLuminance * 0.88, 0.355, 0.42);
	const scale = targetLuminance / sourceLuminance;
	const bounded = [
		clamp(source[0] * scale, 0.14, 0.66),
		clamp(source[1] * scale, 0.14, 0.66),
		clamp(source[2] * scale, 0.14, 0.66),
		clamp(source[3], 0.82, 1)
	];
	return enforceMinimalDemonLuminance(bounded);
}

export function minimalDemonEmissiveColor(color) {
	return color.slice(0, 3).map((channel) => clamp(channel * 0.55, 0.1, 0.34));
}

export function enforceMinimalDemonLuminance(color) {
	const result = [...color];
	for (let pass = 0; pass < 6; pass += 1) {
		const missing = MINIMAL_DEMON_TINT_LUMINANCE_FLOOR
			- relativeLuminance(result);
		if (missing <= 0.00000001) {
			break;
		}
		for (let channel = 0; channel < 3; channel += 1) {
			result[channel] = clamp(result[channel] + missing, 0.14, 0.66);
		}
	}
	return result;
}

function colorArray(value, fallback) {
	if (!Array.isArray(value) && !ArrayBuffer.isView(value)) {
		return [...fallback];
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
