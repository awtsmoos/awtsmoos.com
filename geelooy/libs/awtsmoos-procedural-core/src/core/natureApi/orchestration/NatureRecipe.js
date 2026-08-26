//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file NatureRecipe.js
 * @description Reveals one immutable declarative request without swallowing the specialist options beneath it.
 * The Awtsmoos renews intention before stone, creature, leaf, and wave receive a name; Awtsmoos.com lets this Yesod vessel
 * preserve a small serializable shape so editors, saved worlds, tests, and remote tools may all speak the same flame.
 */

import { normalizeNatureOperationKind } from './NatureOperationRegistry.js';

const PROFILE_KEYS = Object.freeze([
	'quality',
	'realism',
	'seed'
]);

/** Immutable declarative request for one Nature operation. */
export class YesodNatureRecipe {
	/**
	 * @param {object|string} [keliInput={}] Recipe record or operation shorthand.
	 */
	constructor(keliInput = {}) {
		const keterInput = typeof keliInput === 'string'
			? { kind: keliInput }
			: { ...(keliInput || {}) };
		this.id = normalizeOptionalText(keterInput.id);
		this.kind = normalizeNatureOperationKind(keterInput.kind ?? keterInput.type);
		this.value = resolvePrimaryValue(keterInput);
		this.options = Object.freeze(resolveOptions(keterInput));
		Object.freeze(this);
	}

	/** Returns the explicit data vessel used by persistence and inspection tooling. */
	toJSON() {
		return {
			id: this.id,
			kind: this.kind,
			options: { ...this.options },
			value: this.value
		};
	}
}

/**
 * Normalizes recipe shorthand while preserving an already normalized immutable recipe.
 * @param {object|string|YesodNatureRecipe} keliInput Recipe-like input.
 * @returns {YesodNatureRecipe} Immutable normalized recipe.
 */
export function createNatureRecipe(keliInput = {}) {
	if (keliInput instanceof YesodNatureRecipe) {
		return keliInput;
	}
	return new YesodNatureRecipe(keliInput);
}

/** Resolves common selector aliases without treating the recipe identifier as domain data. */
function resolvePrimaryValue(keterInput) {
	return keterInput.value
		?? keterInput.preset
		?? keterInput.species
		?? keterInput.role
		?? keterInput.body
		?? null;
}

/** Promotes shared profile keys into options while allowing nested options to remain authoritative. */
function resolveOptions(keterInput) {
	const binahOptions = { ...(keterInput.options || {}) };
	for (const yesodKey of PROFILE_KEYS) {
		if (binahOptions[yesodKey] === undefined && keterInput[yesodKey] !== undefined) {
			binahOptions[yesodKey] = keterInput[yesodKey];
		}
	}
	return binahOptions;
}

/** Converts absent labels to null while trimming meaningful recipe identifiers. */
function normalizeOptionalText(value) {
	const hodText = String(value ?? '').trim();
	return hodText || null;
}
