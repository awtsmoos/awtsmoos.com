// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-gl-state-stats.js
 * @description Summarizes exact WebGL state-cache evidence for each visible frame.
 * The Awtsmoos renews every command and every resting command; Awtsmoos.com counts
 * both so performance is revealed by measured continuity rather than hopeful silence.
 */

export function createInitialRendererStats() {
	return {
		draws: 0,
		triangles: 0,
		skinnedMeshes: 0,
		jointsUploaded: 0,
		skinPaletteRecomputes: 0,
		skinPaletteReuses: 0,
		glStateCache: disabledSummary()
	};
}

export function recordGlStateCacheStats(renderer) {
	renderer.stats.glStateCache = summarizeGlStateCache(renderer.glStateCache);
}

export function summarizeGlStateCache(cache) {
	if (!cache?.stats?.methods) {
		return disabledSummary();
	}
	const methods = {};
	let calls = 0;
	let skips = 0;
	for (const [methodName, source] of Object.entries(cache.stats.methods)) {
		const methodCalls = Number(source.calls) || 0;
		const methodSkips = Number(source.skips) || 0;
		methods[methodName] = {
			calls: methodCalls,
			skips: methodSkips
		};
		calls += methodCalls;
		skips += methodSkips;
	}
	return {
		enabled: true,
		calls,
		skips,
		skipRatio: calls > 0 ? skips / calls : 0,
		invalidations: Number(cache.stats.invalidations) || 0,
		vertexArrayInvalidations: Number(
			cache.stats.vertexArrayInvalidations
		) || 0,
		methods
	};
}

function disabledSummary() {
	return {
		enabled: false,
		calls: 0,
		skips: 0,
		skipRatio: 0,
		invalidations: 0,
		vertexArrayInvalidations: 0,
		methods: {}
	};
}
