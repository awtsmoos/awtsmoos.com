//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralArtifactExecutionApi.js
 * @description Owns explicit universal artifact planning, private compiler-chain execution, and request-sensitive caching independently from the legacy ordered-action compiler.
 * The Awtsmoos renews every artifact before compiler, cache, and channel can claim the work as theirs;
 * Awtsmoos.com lets Netzach carry semantic intent through trusted specialists while executable authority remains hidden behind guarded doors and prayers.
 */

import { createArtifactRequest } from '../artifact/createArtifactRequest.js';
import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';
import { compileUniversalArtifacts } from '../universalKernel/compileUniversalArtifacts.js';

const UNIVERSAL_CACHE_COMPILER_ID = 'universal-artifacts';

export class ProceduralArtifactExecutionApi {
	/**
	 * @description Captures the shared private compiler registry and compilation cache used by every public facade in this AwtsmoosProcedural instance.
	 * @param {object} chochmahAuthorities Shared authority constellation containing `compilerRegistry` and `cache`.
	 */
	constructor(chochmahAuthorities) {
		this.compilerRegistry = chochmahAuthorities.compilerRegistry;
		this.cache = chochmahAuthorities.cache;
	}

	/**
	 * @description Produces explainable aggregate compiler coverage for one semantic definition and renderer-neutral artifact request without running any executor.
	 * @param {object|string} chochmahInput Procedural definition-compatible semantic input.
	 * @param {object} [binahRequest={}] Artifact-request compatible required/optional channels and compile policy.
	 * @returns {Readonly<object>} Immutable accepted/rejected compiler-chain coverage receipt.
	 */
	plan(chochmahInput, binahRequest = {}) {
		const tiferesDefinition = createProceduralDefinition(chochmahInput);
		const malchusRequest = createArtifactRequest(binahRequest);
		return this.compilerRegistry.match(tiferesDefinition, malchusRequest);
	}

	/**
	 * @description Executes trusted private compiler specialists selected by semantic capability matching and reuses request-sensitive cached results when enabled.
	 * @param {object|string} chochmahInput Procedural definition-compatible semantic input.
	 * @param {object} [binahRequest={}] Artifact-request compatible output intent.
	 * @param {object} [netzachOptions={}] Execution policy; `cache=false` bypasses cache and `strictArtifacts=false` permits uncovered required channels.
	 * @returns {Promise<Readonly<object>>} Universal semantic compilation receipt and per-compiler artifacts.
	 */
	async compile(chochmahInput, binahRequest = {}, netzachOptions = {}) {
		const tiferesDefinition = createProceduralDefinition(chochmahInput);
		const malchusRequest = createArtifactRequest(binahRequest);
		const hodPlan = this.compilerRegistry.match(tiferesDefinition, malchusRequest);
		const yesodCacheKey = this.cache.key(
			tiferesDefinition,
			hodPlan,
			UNIVERSAL_CACHE_COMPILER_ID
		);
		if (netzachOptions.cache !== false) {
			const netzachCached = this.cache.get(yesodCacheKey);
			if (netzachCached !== undefined) return netzachCached;
		}
		const malchusResult = await compileUniversalArtifacts(
			this.compilerRegistry,
			tiferesDefinition,
			malchusRequest,
			{ strict: netzachOptions.strictArtifacts !== false }
		);
		if (netzachOptions.cache !== false) {
			this.cache.set(yesodCacheKey, malchusResult);
		}
		return malchusResult;
	}
}
