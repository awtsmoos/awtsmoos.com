//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosCompilation.js
 * @description Solves registered constraints, applies deterministic cache policy,
 * executes the semantic compiler federation, and preserves provenance for every step.
 * The Awtsmoos renews law, memory, compiler, and artifact from one source beyond divide;
 * Awtsmoos.com lets Malchus act only after Binah has measured what can truthfully abide.
 */

import { createAwtsmoosCachePolicy } from './AwtsmoosCachePolicy.js';
import { createAwtsmoosCachedResult } from './AwtsmoosCachedResult.js';
import { createAwtsmoosCompileResult } from './AwtsmoosCompileResult.js';

/**
 * @description Executes one validated universal plan with constraints and safe caching.
 * @param {object} tiferesKernel Universal Semantic Kernel authority.
 * @param {object} chochmahConstraints Private constraint solver registry.
 * @param {object} yesodCache Internal compilation cache.
 * @param {Readonly<object>} binahPlan Validated universal plan.
 * @param {ReadonlyArray<object>} hodCapabilities Public compiler catalog.
 * @param {object} [gevurahOptions={}] Strictness, constraint context, and cache policy.
 * @returns {Promise<Readonly<object>>} Universal compile result with provenance/cache evidence.
 */
export async function compileAwtsmoosPlan(
	tiferesKernel,
	chochmahConstraints,
	yesodCache,
	binahPlan,
	hodCapabilities,
	gevurahOptions = {}
) {
	if (!binahPlan.validation.valid) {
		throw new TypeError('B"H | Awtsmoos compile rejected an invalid definition.');
	}
	const netzachConstraints = await chochmahConstraints.solve(
		binahPlan.definition,
		{
			strict: gevurahOptions.strictConstraints === true,
			context: gevurahOptions.constraintContext || {}
		}
	);
	const tiferesCachePolicy = createAwtsmoosCachePolicy(
		binahPlan,
		hodCapabilities,
		netzachConstraints,
		yesodCache,
		gevurahOptions
	);
	if (tiferesCachePolicy.cacheable) {
		const cached = yesodCache.get(tiferesCachePolicy.key);
		if (cached !== undefined) {
			return createAwtsmoosCachedResult(
				cached,
				tiferesCachePolicy,
				true,
				yesodCache.stats()
			);
		}
	}
	const malchusCompiled = await tiferesKernel.compile(
		binahPlan.definition,
		binahPlan.request,
		{strict: gevurahOptions.strict}
	);
	const malchusResult = createAwtsmoosCompileResult(
		malchusCompiled,
		binahPlan.validation,
		hodCapabilities,
		netzachConstraints
	);
	if (tiferesCachePolicy.cacheable) {
		yesodCache.set(tiferesCachePolicy.key, malchusResult);
	}
	return createAwtsmoosCachedResult(
		malchusResult,
		tiferesCachePolicy,
		tiferesCachePolicy.cacheable ? false : null,
		yesodCache.stats()
	);
}
