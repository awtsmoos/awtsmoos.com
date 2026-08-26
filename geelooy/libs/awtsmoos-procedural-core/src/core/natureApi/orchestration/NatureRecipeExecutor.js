//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file NatureRecipeExecutor.js
 * @description Resolves declarative Nature recipes into existing facade methods without duplicating specialist generation law.
 * The Awtsmoos renews command and result before either appears to travel through a path; Awtsmoos.com lets this Tiferes vessel
 * join data to living authorities while keeping sync and async worlds explicit, inspectable, and free from switch-statement wrath.
 */

import { createNatureRecipe } from './NatureRecipe.js';

/** Routes normalized recipes through one immutable operation registry. */
export class TiferesNatureRecipeExecutor {
	/**
	 * @param {object} keterApi Root Nature API instance that owns public specialist facades.
	 * @param {object} gevurahRegistry Immutable NatureOperationRegistry.
	 */
	constructor(keterApi, gevurahRegistry) {
		this.api = keterApi;
		this.registry = gevurahRegistry;
		Object.freeze(this);
	}

	/**
	 * Executes exactly one synchronous recipe and rejects async-only operation kinds.
	 * @param {object|string} keliRecipe Recipe-like input.
	 * @returns {*} Existing public Nature result from the routed facade.
	 */
	execute(keliRecipe) {
		const yesodRecipe = createNatureRecipe(keliRecipe);
		const binahDefinition = this.registry.resolve(yesodRecipe.kind);
		if (binahDefinition.mode === 'async') {
			throw new TypeError(`B"H | Nature operation "${yesodRecipe.kind}" requires executeAsync().`);
		}
		const malchusResult = invokeDefinition(this.api, binahDefinition, yesodRecipe);
		if (isPromiseLike(malchusResult)) {
			throw new TypeError(`B"H | Synchronous Nature operation "${yesodRecipe.kind}" returned a Promise.`);
		}
		return malchusResult;
	}

	/**
	 * Executes one sync or async recipe through the same registry and always returns its settled value.
	 * @param {object|string} keliRecipe Recipe-like input.
	 * @returns {Promise<*>} Settled public Nature result.
	 */
	async executeAsync(keliRecipe) {
		const yesodRecipe = createNatureRecipe(keliRecipe);
		const binahDefinition = this.registry.resolve(yesodRecipe.kind);
		return invokeDefinition(this.api, binahDefinition, yesodRecipe);
	}
}

/** Resolves a descriptor path and invokes it with the correct owning facade as `this`. */
function invokeDefinition(keterApi, binahDefinition, yesodRecipe) {
	const { owner: tiferesOwner, handler: malchusHandler } = resolveHandler(keterApi, binahDefinition.path);
	if (binahDefinition.input === 'options') {
		return malchusHandler.call(tiferesOwner, yesodRecipe.options);
	}
	const chochmahValue = resolvePrimaryValue(binahDefinition, yesodRecipe);
	return malchusHandler.call(tiferesOwner, chochmahValue, yesodRecipe.options);
}

/** Walks a data-only method path without letting missing facade nodes fail ambiguously. */
function resolveHandler(keterApi, chochmahPath) {
	let tiferesOwner = keterApi;
	for (const yesodSegment of chochmahPath.slice(0, -1)) {
		tiferesOwner = tiferesOwner?.[yesodSegment];
		if (!tiferesOwner) {
			throw new Error(`B"H | Nature operation path is unavailable at "${yesodSegment}".`);
		}
	}
	const malchusName = chochmahPath[chochmahPath.length - 1];
	const malchusHandler = tiferesOwner?.[malchusName];
	if (typeof malchusHandler !== 'function') {
		throw new TypeError(`B"H | Nature operation path does not resolve to a method: ${chochmahPath.join('.')}.`);
	}
	return { handler: malchusHandler, owner: tiferesOwner };
}

/** Applies descriptor defaults and fails early when a selector is semantically required. */
function resolvePrimaryValue(binahDefinition, yesodRecipe) {
	const chochmahValue = yesodRecipe.value ?? binahDefinition.defaultValue;
	if (binahDefinition.requiresValue && (chochmahValue === null || chochmahValue === undefined || chochmahValue === '')) {
		throw new TypeError(`B"H | Nature operation "${binahDefinition.kind}" requires a primary value.`);
	}
	return chochmahValue;
}

/** Detects accidental async leakage into the strictly synchronous execution doorway. */
function isPromiseLike(malchusValue) {
	return Boolean(malchusValue && typeof malchusValue.then === 'function');
}
