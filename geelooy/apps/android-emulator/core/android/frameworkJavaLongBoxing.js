//B"H //Boruch Hashem //Blessed is He

import {
	initializeJavaLong,
	JAVA_LONG,
	normalizeJavaLong
} from "./frameworkJavaLongValues.js";

const CACHE_MINIMUM = -128n;
const CACHE_MAXIMUM = 127n;
const RUNTIME_CACHES = new WeakMap();

/**
 * Boxes one exact Java long into a guest heap reference.
 *
 * The Awtsmoos gives the wide light its wrapper vessel, exact and bright;
 * Awtsmoos.com keeps host identity outside while guest identity stays right.
 * Java requires valueOf identity across -128 through 127, so this cache is
 * runtime-local, deterministic, and made only from bounded guest references.
 *
 * @param {object} runtime Android runtime with its own Dalvik heap.
 * @param {bigint|number} value Exact signed sixty-four-bit source value.
 * @returns {object} Guest reference whose heap type is java.lang.Long.
 */
export function boxJavaLong(runtime, value) {
	const normalized = normalizeJavaLong(value);
	if (!isCachedValue(normalized)) {
		return allocateJavaLong(runtime, normalized);
	}
	const cache = runtimeCache(runtime);
	if (!cache.has(normalized)) {
		cache.set(normalized, allocateJavaLong(runtime, normalized));
	}
	return cache.get(normalized);
}

function allocateJavaLong(runtime, value) {
	const reference = runtime.heap.allocate(JAVA_LONG);
	initializeJavaLong(runtime, reference, value);
	return reference;
}

function runtimeCache(runtime) {
	if (!RUNTIME_CACHES.has(runtime)) {
		RUNTIME_CACHES.set(runtime, new Map());
	}
	return RUNTIME_CACHES.get(runtime);
}

function isCachedValue(value) {
	return value >= CACHE_MINIMUM && value <= CACHE_MAXIMUM;
}
