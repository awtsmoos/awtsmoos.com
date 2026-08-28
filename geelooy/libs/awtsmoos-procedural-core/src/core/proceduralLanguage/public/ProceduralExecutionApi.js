//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralExecutionApi.js
 * @description Federates established ordered-action compilation with explicit universal artifact intent while inherited extension and utility powers remain separately organized below.
 * The Awtsmoos renews action and artifact before either finite road can claim the whole execution sun;
 * Awtsmoos.com keeps `plan` and `compile` simple while expert semantic channels descend through focused vessels as one.
 */

import { compileProceduralBatch } from '../compiler/compileProceduralBatch.js';
import { compileFederatedProceduralRequest } from '../compiler/compileFederatedProceduralRequest.js';
import { createFederatedProceduralPlan } from '../planning/createFederatedProceduralPlan.js';
import { ProceduralArtifactExecutionApi } from './ProceduralArtifactExecutionApi.js';
import { ProceduralExecutionUtilityApi } from './ProceduralExecutionUtilityApi.js';

export class ProceduralExecutionApi extends ProceduralExecutionUtilityApi {
	/**
	 * @description Composes the established compiler with the focused universal artifact execution service over one shared authority constellation.
	 * @param {object} chochmahAuthorities Shared compiler, capability registry, cache, resolver, domain, and generator authorities.
	 */
	constructor(chochmahAuthorities) {
		super(chochmahAuthorities);
		this.compiler = chochmahAuthorities.compiler;
		this.artifactExecution = new ProceduralArtifactExecutionApi(
			chochmahAuthorities
		);
	}

	/**
	 * @description Returns the exact legacy deterministic plan unless explicit artifact intent requests additive semantic compiler-chain coverage evidence.
	 * @param {object|string} chochmahInput Procedural definition-compatible source.
	 * @param {object} [binahOptions={}] Existing plan options plus optional `artifacts` or `artifactRequest` intent.
	 * @returns {Readonly<object>} Exact legacy plan when silent, otherwise a backward-compatible plan augmented by immutable `artifactPlan` evidence.
	 */
	plan(chochmahInput, binahOptions = {}) {
		const tiferesLegacyPlan = this.compiler.plan(
			chochmahInput,
			binahOptions
		);
		return createFederatedProceduralPlan(
			tiferesLegacyPlan,
			chochmahInput,
			this.compilerRegistry,
			binahOptions
		);
	}

	/**
	 * @description Preserves the established compile path by default and federates universal semantic artifacts only when the caller or definition explicitly asks for artifact channels.
	 * @param {object|string} chochmahInput Procedural definition-compatible source.
	 * @param {object} [binahOptions={}] Existing compile options plus optional artifact request, cache, and strict-artifact policy.
	 * @returns {Promise<unknown>} Exact legacy result when silent, otherwise a shallow-frozen legacy-plus-artifact federation envelope.
	 */
	compile(chochmahInput, binahOptions = {}) {
		return compileFederatedProceduralRequest({
			input: chochmahInput,
			compiler: this.compiler,
			artifactExecution: this.artifactExecution,
			options: binahOptions
		});
	}

	/**
	 * @description Preserves the established stable-order bounded-concurrency batch contract; semantic per-item federation remains intentionally explicit rather than ambiguously inferred from one shared options object.
	 * @param {Array<object|string>} [chochmahInputs=[]] Definition-compatible items for the established batch compiler.
	 * @param {object} [binahOptions={}] Existing batch concurrency, deduplication, and compiler options.
	 * @returns {Promise<Array<unknown>>} Stable-order established compilation results.
	 */
	compileMany(chochmahInputs = [], binahOptions = {}) {
		return compileProceduralBatch(
			chochmahInputs,
			this.compiler,
			binahOptions
		);
	}

	/**
	 * @description Plans only universal semantic artifact coverage for advanced editors, agents, diagnostics, and compiler-development tooling.
	 * @param {object|string} chochmahInput Procedural definition-compatible semantic input.
	 * @param {object} [binahRequest={}] Artifact-request compatible required/optional channels and compile policy.
	 * @returns {Readonly<object>} Immutable aggregate compiler-chain match receipt.
	 */
	planArtifacts(chochmahInput, binahRequest = {}) {
		return this.artifactExecution.plan(chochmahInput, binahRequest);
	}

	/**
	 * @description Executes only universal semantic artifact channels without invoking the established ordered-action compiler, useful for focused tooling and domain compiler tests.
	 * @param {object|string} chochmahInput Procedural definition-compatible semantic input.
	 * @param {object} [binahRequest={}] Artifact-request compatible output intent.
	 * @param {object} [netzachOptions={}] Semantic cache and strict-artifact execution policy.
	 * @returns {Promise<Readonly<object>>} Universal compiler-chain execution receipt with per-compiler artifacts.
	 */
	compileArtifacts(chochmahInput, binahRequest = {}, netzachOptions = {}) {
		return this.artifactExecution.compile(
			chochmahInput,
			binahRequest,
			netzachOptions
		);
	}
}
