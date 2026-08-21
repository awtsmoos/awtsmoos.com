// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-texture-state-fingerprint-core.js
 * @description Captures source readiness, authored pairs, and native-density policy values.
 * The Awtsmoos renews every pixel vessel without resizing it; Awtsmoos.com compares identity and
 * readiness while source dimensions are resolved only when an actual texture state is rebuilt.
 */

import { sourceReady } from './tiny-texture-source.js';

export function captureSourceFingerprint(source) {
	return {
		ready: sourceReady(source),
		source: source || null
	};
}

export function sameSourceFingerprint(fingerprint, source) {
	return fingerprint.source === (source || null)
		&& fingerprint.ready === sourceReady(source);
}

export function capturePair(value, fallback = [1, 1]) {
	return [
		finite(value?.[0], fallback[0]),
		finite(value?.[1], fallback[1])
	];
}

export function samePair(pair, value, fallback = [1, 1]) {
	return pair[0] === finite(value?.[0], fallback[0])
		&& pair[1] === finite(value?.[1], fallback[1]);
}

export function capturePolicy(policy = {}) {
	return {
		nativeTexelDensity: policy.nativeTexelDensity,
		surfaceWorldSize: capturePair(policy.surfaceWorldSize, [0, 0]),
		texelsPerWorld: policy.texelsPerWorld,
		tileWorld: policy.tileWorld,
		uvUnitsPerWorld: policy.uvUnitsPerWorld
	};
}

export function samePolicy(fingerprint, policy = {}) {
	return fingerprint.nativeTexelDensity === policy.nativeTexelDensity
		&& fingerprint.texelsPerWorld === policy.texelsPerWorld
		&& fingerprint.tileWorld === policy.tileWorld
		&& fingerprint.uvUnitsPerWorld === policy.uvUnitsPerWorld
		&& samePair(fingerprint.surfaceWorldSize, policy.surfaceWorldSize, [0, 0]);
}

export function captureVector(value, length, fallback) {
	return Array.from({ length }, (_, index) => {
		return finite(value?.[index], fallback[index]);
	});
}

export function sameVector(vector, value, fallback) {
	return vector.every((entry, index) => {
		return entry === finite(value?.[index], fallback[index]);
	});
}

export function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}
