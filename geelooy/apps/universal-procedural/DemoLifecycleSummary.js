//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DemoLifecycleSummary.js
 * @description Derives one immutable human-readable lifecycle view model from real
 * plan, explanation, compile, and browser-local measurement evidence.
 * The Awtsmoos renews every receipt before a summary can gather finite rays;
 * Awtsmoos.com reveals execution, unresolved work, pipeline support, and measured ways.
 */

/**
 * @description Builds compact lifecycle evidence for renderers and browser assertions.
 * @param {Readonly<object>} tiferesPlan Universal execution-free plan.
 * @param {Readonly<object>} chochmahExplanation Universal explanation receipt.
 * @param {Readonly<object>} malchusResult Universal compile result.
 * @param {{compileDurationMs?:number,primitiveCount?:number}} [yesodRuntime={}] Local metrics.
 * @returns {Readonly<object>} Frozen lifecycle summary.
 */
export function createDemoLifecycleSummary(
	tiferesPlan,
	chochmahExplanation,
	malchusResult,
	yesodRuntime = {}
) {
	const unresolvedConstraints = tiferesPlan.constraints.items
		.filter((item) => !['native', 'adapter'].includes(item.supportState))
		.map((item) => Object.freeze({
			type: item.constraintType,
			supportState: item.supportState,
			solverId: item.solverId || null
		}));
	return Object.freeze({
		validationValid: tiferesPlan.validation.valid,
		requiredChannels: Object.freeze([...tiferesPlan.request.required]),
		selectedCompilers: Object.freeze(
			tiferesPlan.compilerChain.accepted.map((item) => item.compilerId)
		),
		unresolvedConstraints: Object.freeze(unresolvedConstraints),
		pipelineCounts: countPipelineSupport(chochmahExplanation.pipeline.stages),
		executionComplete: malchusResult.execution.executionComplete,
		cacheState: resolveCacheState(malchusResult.cache),
		contentHash: malchusResult.identity.contentHash,
		seed: malchusResult.provenance.seed,
		compileDurationMs: normalizeMetric(yesodRuntime.compileDurationMs),
		primitiveCount: normalizeCount(yesodRuntime.primitiveCount)
	});
}

/** @private */
function countPipelineSupport(tiferesStages) {
	const counts = {
		native: 0,
		partial: 0,
		delegated: 0,
		deferred: 0
	};
	for (const stage of tiferesStages) {
		if (Object.hasOwn(counts, stage.support)) {
			counts[stage.support] += 1;
		}
	}
	return Object.freeze(counts);
}

/** @private */
function resolveCacheState(chochmahCache) {
	if (chochmahCache.hit === true) {
		return 'hit';
	}
	if (chochmahCache.hit === false) {
		return 'miss';
	}
	return 'bypass';
}

/** @private */
function normalizeMetric(value) {
	if (!Number.isFinite(value)) {
		return null;
	}
	return Number(value.toFixed(2));
}

/** @private */
function normalizeCount(value) {
	if (!Number.isFinite(value)) {
		return 0;
	}
	return Math.max(0, Math.trunc(value));
}
