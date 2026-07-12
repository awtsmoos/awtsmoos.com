// B"H
import {
	CACHED_GL_METHODS,
	createGlStateModel,
	decideGlStateCall
} from './tiny-gl-state-model.js';

const CACHE_SYMBOL = Symbol.for('Awtsmoos.tinyGlStateCache');

/**
 * Installs one exact WebGL state vessel. Every unknown first command reaches the
 * driver; only commands already revealed in identical state are suppressed.
 */
export function installGlStateCache(gl) {
	if (gl[CACHE_SYMBOL]) return gl[CACHE_SYMBOL];
	const originals = new Map();
	const cache = {
		state: createGlStateModel(),
		stats: createStats(),
		invalidate() {
			cache.state = createGlStateModel();
			cache.stats.invalidations += 1;
		},
		restore() {
			for (const [name, original] of originals) gl[name] = original;
			delete gl[CACHE_SYMBOL];
		}
	};
	for (const methodName of CACHED_GL_METHODS) {
		const original = gl[methodName];
		originals.set(methodName, original);
		gl[methodName] = function cachedGlStateCall(...args) {
			const record = cache.stats.methods[methodName];
			record.calls += 1;
			const decision = decideGlStateCall(
				methodName,
				args,
				cache.state,
				gl
			);
			if (decision.skip) {
				record.skips += 1;
				return undefined;
			}
			const result = original.apply(this, args);
			decision.commit();
			return result;
		};
	}
	gl[CACHE_SYMBOL] = cache;
	return cache;
}

function createStats() {
	return {
		invalidations: 0,
		methods: Object.fromEntries(
			CACHED_GL_METHODS.map((name) => [
				name,
				{ calls: 0, skips: 0 }
			])
	};
}
