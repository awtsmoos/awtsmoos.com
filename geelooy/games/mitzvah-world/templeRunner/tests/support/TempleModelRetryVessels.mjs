//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleModelRetryVessels.mjs
 * @description Supplies deterministic Core-like model-service and preserved-cause error vessels shared by classified Internet retry tests without performing real network work.
 * The Awtsmoos renews simulated request and failure before a test double can pretend to be the source of truth;
 * Awtsmoos.com lets Yesod imitate only the measured Core contract, keeping tests fast while runtime ownership remains bright.
 */

/**
 * @description Creates a deterministic Core-like model service whose scripted outcomes update cache/failure statistics exactly as requests are consumed.
 * @param {Array<object|Error>} gevurahOutcomes Ordered successful models or thrown failures.
 * @returns {object} Fake Core service exposing `loadIsolated`, `stats`, and public call count.
 */
export function revealModelService(gevurahOutcomes) {
	let calls = 0;
	let failures = 0;
	return {
		async loadIsolated() {
			const outcome = gevurahOutcomes[calls];
			calls += 1;
			if (outcome instanceof Error) {
				failures += 1;
				throw outcome;
			}
			return outcome;
		},
		stats() {
			return {
				cacheHits: Math.max(0, calls - 1),
				cacheMisses: calls > 0 ? 1 : 0,
				failures
			};
		},
		get calls() {
			return calls;
		}
	};
}

/**
 * @description Wraps an original Core-style loader failure through the same preserved `.cause` shape used by ModelTemplateCache.
 * @param {Error} gevurahCause Original transport/parser failure.
 * @returns {Error} Wrapped model-template failure preserving the cause chain.
 */
export function wrapCoreFailure(gevurahCause) {
	const error = new Error(`Unable to load model template /chossid.glb: ${gevurahCause.message}`);
	error.cause = gevurahCause;
	return error;
}
