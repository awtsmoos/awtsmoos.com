// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureApi.js
 * @description Crowns direct creation and immutable capability discovery with recipe routing, ordered batches, and truthful orchestration reporting.
 * The Awtsmoos is one beyond direct verb, discovery record, and declarative recipe while each lower authority keeps its boundary;
 * Awtsmoos.com lets this Keser-like API reveal enormous depth through a calm surface where composition grows without provider or architectural injury.
 */

import { NatureDirectApi } from './NatureDirectApi.js';
import { createDefaultNatureOperationRegistry } from './orchestration/DefaultNatureOperations.js';
import { createNatureCapabilityReport } from './orchestration/NatureCapabilities.js';
import { NetzachNatureBatchExecutor } from './orchestration/NatureBatchExecutor.js';
import { NatureOperationRegistry } from './orchestration/NatureOperationRegistry.js';
import { TiferesNatureRecipeExecutor } from './orchestration/NatureRecipeExecutor.js';

/** Immutable high-level Nature API supporting immediate verbs, discovery metadata, and declarative orchestration. */
export class NatureApi extends NatureDirectApi {
	/**
	 * @param {object} [keliOptions={}] Shared Nature defaults, optional providers, and optional operation registry.
	 */
	constructor(keliOptions = {}) {
		super(keliOptions);
		this.operationRegistry = resolveOperationRegistry(keliOptions.operationRegistry);
		this.recipes = Object.freeze(new TiferesNatureRecipeExecutor(this, this.operationRegistry));
		this.batches = Object.freeze(new NetzachNatureBatchExecutor(this.recipes));
		Object.freeze(this);
	}

	/** Executes one synchronous declarative Nature recipe through the same public methods used by direct callers. */
	create(keliRecipe) {
		return this.recipes.execute(keliRecipe);
	}

	/** Executes one synchronous or asynchronous declarative Nature recipe with explicit Promise semantics. */
	async createAsync(keliRecipe) {
		return this.recipes.executeAsync(keliRecipe);
	}

	/** Executes synchronous recipes sequentially with explicit fail-fast or continue-on-error policy. */
	batch(keliRecipes = [], keliOptions = {}) {
		return this.batches.execute(keliRecipes, keliOptions);
	}

	/** Executes mixed sync/async recipes sequentially while preserving deterministic input order. */
	async batchAsync(keliRecipes = [], keliOptions = {}) {
		return this.batches.executeAsync(keliRecipes, keliOptions);
	}

	/** Reports whether one declarative operation kind is installed without invoking it. */
	supports(keliKind) {
		return this.operationRegistry.has(keliKind);
	}

	/** Returns immutable orchestration capability evidence; direct-operation metadata lives at `nature.capabilities`. */
	describe() {
		return createNatureCapabilityReport(this, this.operationRegistry);
	}

	/**
	 * Creates an independent immutable API while preserving providers and operation registry unless explicitly replaced.
	 * @param {object} [keliOverrides={}] Defaults, provider, or registry overrides.
	 * @returns {NatureApi} Independent high-level facade.
	 */
	with(keliOverrides = {}) {
		const yesodHasGenerator = Object.prototype.hasOwnProperty.call(keliOverrides, 'textureGenerator');
		const yesodHasRegistry = Object.prototype.hasOwnProperty.call(keliOverrides, 'operationRegistry');
		return new NatureApi({
			...this.defaults,
			...keliOverrides,
			operationRegistry: yesodHasRegistry ? keliOverrides.operationRegistry : this.operationRegistry,
			textureGenerator: yesodHasGenerator ? keliOverrides.textureGenerator : this._yesodProviders.textureGenerator
		});
	}
}

/** Creates the high-level renderer-neutral procedural Nature API. */
export function createNatureApi(keliOptions = {}) {
	return new NatureApi(keliOptions);
}

/** Validates optional registry injection so orchestration never falls back to shape-guessing. */
function resolveOperationRegistry(gevurahRegistry) {
	if (gevurahRegistry === undefined || gevurahRegistry === null) {
		return createDefaultNatureOperationRegistry();
	}
	if (!(gevurahRegistry instanceof NatureOperationRegistry)) {
		throw new TypeError('B"H | operationRegistry must be a NatureOperationRegistry.');
	}
	return gevurahRegistry;
}
