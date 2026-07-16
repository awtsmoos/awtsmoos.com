// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-gl-state-cache.js
 * @description Suppresses only proven-identical WebGL declarations and exposes exact invalidation.
 * The Awtsmoos renews every command; Awtsmoos.com remembers only witnessed continuity, while
 * vertex-array changes erase precisely the hidden bindings they can alter and nothing more.
 */

import {
	CACHED_GL_METHODS,
	createGlStateModel,
	decideGlStateCall
} from './tiny-gl-state-model.js';

const CACHE_SYMBOL = Symbol.for('Awtsmoos.tinyGlStateCache');

export function installGlStateCache(gl) {
	const existingCache = gl[CACHE_SYMBOL];
	if (existingCache) return existingCache;
	const originalMethods = captureOriginalMethods(gl);
	const cache = createCacheController(gl, originalMethods);
	installCachedMethods(gl, cache, originalMethods);
	gl[CACHE_SYMBOL] = cache;
	return cache;
}

function captureOriginalMethods(gl) {
	return new Map(CACHED_GL_METHODS.map(methodName => [
		methodName,
		gl[methodName]
	]));
}

function createCacheController(gl, originalMethods) {
	const cache = {
		state: createGlStateModel(),
		stats: createStats(),
		invalidate() {
			cache.state = createGlStateModel();
			cache.stats.invalidations += 1;
		},
		invalidateVertexArrayState() {
			cache.state.buffers.clear();
			cache.state.attributes.clear();
			cache.state.pointers.clear();
			cache.stats.vertexArrayInvalidations += 1;
		},
		restore() {
			for (const [methodName, originalMethod] of originalMethods) {
				gl[methodName] = originalMethod;
			}
			delete gl[CACHE_SYMBOL];
		}
	};
	return cache;
}

function installCachedMethods(gl, cache, originalMethods) {
	for (const [methodName, originalMethod] of originalMethods) {
		gl[methodName] = function cachedGlStateCall(...argumentsList) {
			const methodStats = cache.stats.methods[methodName];
			methodStats.calls += 1;
			const decision = decideGlStateCall(
				methodName,
				argumentsList,
				cache.state,
				gl
			);
			if (decision.skip) {
				methodStats.skips += 1;
				return undefined;
			}
			const result = originalMethod.apply(this, argumentsList);
			decision.commit();
			return result;
		};
	}
}

function createStats() {
	const methods = CACHED_GL_METHODS.map(methodName => [
		methodName,
		{
			calls: 0,
			skips: 0
		}
	]);
	return {
		invalidations: 0,
		vertexArrayInvalidations: 0,
		methods: Object.fromEntries(methods)
	};
}
