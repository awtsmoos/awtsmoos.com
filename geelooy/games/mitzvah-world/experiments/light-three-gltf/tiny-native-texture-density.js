// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-native-texture-density.js
 * @description Converts original image pixels into exact world-space repeat multipliers.
 * The Awtsmoos does not enlarge or diminish the finite image vessel; Awtsmoos.com keeps
 * every source untouched while measured UV repetition reveals constant physical texel scale.
 */

import { sourceHeight, sourceWidth } from './tiny-texture-source.js';

export const DEFAULT_NATIVE_TEXELS_PER_WORLD = 96;

export function resolveNativeTextureRepeat(source, authoredRepeat, policy = {}, overrides = {}) {
	const resolvedPolicy = { ...policy, ...overrides };
	const fallback = finitePair(authoredRepeat, [1, 1]);
	if (!nativeDensityEnabled(resolvedPolicy)) return fallback;
	const dimensions = textureDimensions(source);
	if (!dimensions.ready) return fallback;
	const density = positivePair(
		resolvedPolicy.texelsPerWorld,
		[DEFAULT_NATIVE_TEXELS_PER_WORLD, DEFAULT_NATIVE_TEXELS_PER_WORLD]
	);
	const surface = optionalPositivePair(resolvedPolicy.surfaceWorldSize);
	if (surface) {
		return [
			surface[0] * density[0] / dimensions.width,
			surface[1] * density[1] / dimensions.height
		];
	}
	const uvUnits = uvUnitsPerWorld(resolvedPolicy);
	if (!uvUnits) return fallback;
	return [
		density[0] / (dimensions.width * uvUnits[0]),
		density[1] / (dimensions.height * uvUnits[1])
	];
}

export function nativeTextureDensityEvidence(source, authoredRepeat, policy = {}) {
	const dimensions = textureDimensions(source);
	return Object.freeze({
		effectiveRepeat: Object.freeze(resolveNativeTextureRepeat(source, authoredRepeat, policy)),
		nativeDensity: nativeDensityEnabled(policy),
		originalHeight: dimensions.height,
		originalWidth: dimensions.width,
		resampled: false,
		texelsPerWorld: Object.freeze(positivePair(
			policy.texelsPerWorld,
			[DEFAULT_NATIVE_TEXELS_PER_WORLD, DEFAULT_NATIVE_TEXELS_PER_WORLD]
		))
	});
}

export function nativeTexturePolicySignature(policy = {}) {
	const density = positivePair(policy.texelsPerWorld, [0, 0]);
	const surface = finitePair(policy.surfaceWorldSize, [0, 0]);
	const uvUnits = uvUnitsPerWorld(policy) || [0, 0];
	return [
		policy.nativeTexelDensity === false ? 0 : nativeDensityEnabled(policy) ? 1 : 0,
		density[0], density[1], uvUnits[0], uvUnits[1], surface[0], surface[1]
	];
}

function nativeDensityEnabled(policy) {
	if (policy.nativeTexelDensity === false) return false;
	return policy.nativeTexelDensity === true
		|| Boolean(optionalPositivePair(policy.uvUnitsPerWorld))
		|| Boolean(optionalPositivePair(policy.surfaceWorldSize))
		|| Boolean(optionalPositivePair(policy.tileWorld));
}

function uvUnitsPerWorld(policy) {
	const explicit = optionalPositivePair(policy.uvUnitsPerWorld);
	if (explicit) return explicit;
	const tileWorld = optionalPositivePair(policy.tileWorld);
	return tileWorld ? [1 / tileWorld[0], 1 / tileWorld[1]] : null;
}

function textureDimensions(source) {
	const width = sourceWidth(source);
	const height = sourceHeight(source);
	return { height, ready: width > 0 && height > 0 && source?.complete !== false, width };
}

function optionalPositivePair(value) {
	if (Array.isArray(value)) {
		const pair = [Number(value[0]), Number(value[1])];
		return pair.every(item => Number.isFinite(item) && item > 0) ? pair : null;
	}
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? [number, number] : null;
}

function positivePair(value, fallback) {
	return optionalPositivePair(value) || [...fallback];
}

function finitePair(value, fallback) {
	if (!Array.isArray(value)) return [...fallback];
	return value.slice(0, 2).map((item, index) => (
		Number.isFinite(Number(item)) ? Number(item) : fallback[index]
	));
}
