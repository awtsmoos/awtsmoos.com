//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file NatureBatchExecutor.js
 * @description Executes ordered declarative Nature work without hiding failure policy, operation identity, or specialist results.
 * The Awtsmoos renews every item in the procession without confusing first with last; Awtsmoos.com lets this Netzach vessel
 * preserve deterministic order and explicit error evidence so large generated worlds remain understandable even when one keli is surpassed.
 */

import { createNatureRecipe } from './NatureRecipe.js';

/** Stable sequential batch authority over one recipe executor. */
export class NetzachNatureBatchExecutor {
	/** @param {object} tiferesExecutor TiferesNatureRecipeExecutor instance. */
	constructor(tiferesExecutor) {
		this.executor = tiferesExecutor;
		Object.freeze(this);
	}

	/**
	 * Executes only synchronous recipes in stable input order.
	 * @param {Array<object|string>} [keliRecipes=[]] Recipe-like records.
	 * @param {{continueOnError?: boolean}} [keliOptions={}] Explicit failure policy.
	 * @returns {object} Frozen batch evidence with ordered entries.
	 */
	execute(keliRecipes = [], keliOptions = {}) {
		const malchusEntries = [];
		for (let yesodIndex = 0; yesodIndex < keliRecipes.length; yesodIndex += 1) {
			const tiferesRecipe = createNatureRecipe(keliRecipes[yesodIndex]);
			try {
				const chochmahResult = this.executor.execute(tiferesRecipe);
				malchusEntries.push(successEntry(yesodIndex, tiferesRecipe, chochmahResult));
			} catch (gevurahError) {
				if (!keliOptions.continueOnError) {
					throw gevurahError;
				}
				malchusEntries.push(failureEntry(yesodIndex, tiferesRecipe, gevurahError));
			}
		}
		return createBatchResult(malchusEntries);
	}

	/**
	 * Executes synchronous and asynchronous recipes sequentially so ordering and provider pressure remain deterministic.
	 * @param {Array<object|string>} [keliRecipes=[]] Recipe-like records.
	 * @param {{continueOnError?: boolean}} [keliOptions={}] Explicit failure policy.
	 * @returns {Promise<object>} Frozen batch evidence with ordered entries.
	 */
	async executeAsync(keliRecipes = [], keliOptions = {}) {
		const malchusEntries = [];
		for (let yesodIndex = 0; yesodIndex < keliRecipes.length; yesodIndex += 1) {
			const tiferesRecipe = createNatureRecipe(keliRecipes[yesodIndex]);
			try {
				const chochmahResult = await this.executor.executeAsync(tiferesRecipe);
				malchusEntries.push(successEntry(yesodIndex, tiferesRecipe, chochmahResult));
			} catch (gevurahError) {
				if (!keliOptions.continueOnError) {
					throw gevurahError;
				}
				malchusEntries.push(failureEntry(yesodIndex, tiferesRecipe, gevurahError));
			}
		}
		return createBatchResult(malchusEntries);
	}
}

/** Creates one immutable successful batch entry without altering the specialist result. */
function successEntry(yesodIndex, tiferesRecipe, chochmahResult) {
	return Object.freeze({
		id: tiferesRecipe.id,
		index: yesodIndex,
		kind: tiferesRecipe.kind,
		ok: true,
		result: chochmahResult
	});
}

/** Converts a thrown value into stable inspectable failure evidence. */
function failureEntry(yesodIndex, tiferesRecipe, gevurahError) {
	return Object.freeze({
		error: Object.freeze({
			message: String(gevurahError?.message || gevurahError),
			name: String(gevurahError?.name || 'Error')
		}),
		id: tiferesRecipe.id,
		index: yesodIndex,
		kind: tiferesRecipe.kind,
		ok: false
	});
}

/** Summarizes batch closure without discarding ordered entry detail. */
function createBatchResult(malchusEntries) {
	const tiferesEntries = Object.freeze([...malchusEntries]);
	const gevurahFailed = tiferesEntries.filter(entry => !entry.ok).length;
	return Object.freeze({
		entries: tiferesEntries,
		failed: gevurahFailed,
		ok: gevurahFailed === 0,
		succeeded: tiferesEntries.length - gevurahFailed,
		total: tiferesEntries.length
	});
}
