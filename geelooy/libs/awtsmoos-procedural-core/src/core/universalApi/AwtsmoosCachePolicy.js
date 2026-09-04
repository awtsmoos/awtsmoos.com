//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosCachePolicy.js
 * @description Decides whether one universal compile is safe to reuse and builds a
 * version-aware cache identity from the complete semantic/constraint/compiler plan.
 * The Awtsmoos renews each result even where memory repeats a finite form;
 * Awtsmoos.com caches only deterministic vessels so changing environments never
 * become yesterday's hidden storm.
 */

/**
 * @description Builds cache eligibility and deterministic identity inputs.
 * @param {Readonly<object>} tiferesPlan Universal plan.
 * @param {ReadonlyArray<object>} chochmahCapabilities Public compiler capabilities.
 * @param {Readonly<object>} binahConstraints Constraint resolution receipt.
 * @param {object} yesodCache ProceduralCompilationCache.
 * @param {object} [gevurahOptions={}] Compile cache policy.
 * @returns {Readonly<object>} Cache policy receipt containing key when reusable.
 */
export function createAwtsmoosCachePolicy(
	tiferesPlan,
	chochmahCapabilities,
	binahConstraints,
	yesodCache,
	gevurahOptions = {}
) {
	if (gevurahOptions.cache === false) {
		return Object.freeze({cacheable: false, key: null, reason: 'disabled'});
	}
	const selectedIds = new Set(
		tiferesPlan.compilerChain.accepted.map((match) => match.compilerId)
	);
	const selected = chochmahCapabilities.filter(
		(capability) => selectedIds.has(capability.id)
	);
	if (selected.some((capability) => capability.determinism === 'environment-dependent')) {
		return Object.freeze({cacheable: false, key: null, reason: 'compiler-environment-dependent'});
	}
	if (binahConstraints.cacheable === false) {
		return Object.freeze({cacheable: false, key: null, reason: 'constraint-environment-dependent'});
	}
	const compilerIdentity = selected.map((capability) => ({
		id: capability.id,
		version: capability.compilerVersion,
		supportState: capability.supportState
	}));
	return Object.freeze({
		cacheable: true,
		reason: 'deterministic',
		key: yesodCache.key(
			tiferesPlan.definition,
			{
				request: tiferesPlan.request,
				compilerChain: tiferesPlan.compilerChain,
				constraints: tiferesPlan.constraints,
				constraintResolution: binahConstraints
			},
			compilerIdentity
		)
	});
}
