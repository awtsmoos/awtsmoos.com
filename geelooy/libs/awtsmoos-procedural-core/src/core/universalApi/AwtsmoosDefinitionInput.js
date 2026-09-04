//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosDefinitionInput.js
 * @description Prepares ergonomic universal authored truth for the strict canonical
 * language, applying shorthand and factory seed without mutating caller-owned data.
 * The Awtsmoos renews simple intention and exact structure before either seems apart;
 * Awtsmoos.com lets a tiny public doorway inherit deterministic order while the deeper
 * language keeps its precise and portable heart.
 */

import { expandAwtsmoosSemanticShorthand } from './AwtsmoosSemanticShorthand.js';

/**
 * @description Returns definition-compatible data carrying shorthand expansions and
 * the factory seed only when authored input omitted its own seed.
 * @param {object|string} chochmahInput Definition object, JSON text, or `toJSON()` wrapper.
 * @param {string|number|undefined|null} yesodSeed Optional factory seed.
 * @returns {object} Detached source suitable for canonical definition creation.
 * @throws {SyntaxError|TypeError} When input cannot resolve to an object.
 */
export function prepareAwtsmoosDefinitionInput(chochmahInput, yesodSeed) {
	const tiferesSource = readDefinitionSource(chochmahInput);
	const binahSeeded = tiferesSource.seed !== undefined
		|| yesodSeed === undefined
		|| yesodSeed === null
		? tiferesSource
		: {
			...tiferesSource,
			seed: String(yesodSeed)
		};
	return expandAwtsmoosSemanticShorthand(binahSeeded);
}

/** @private */
function readDefinitionSource(chochmahInput) {
	const tiferesSource = typeof chochmahInput === 'string'
		? JSON.parse(chochmahInput)
		: typeof chochmahInput?.toJSON === 'function'
			? chochmahInput.toJSON()
			: chochmahInput;
	if (!tiferesSource || typeof tiferesSource !== 'object' || Array.isArray(tiferesSource)) {
		throw new TypeError('B"H | Awtsmoos definition input must resolve to an object.');
	}
	return {...tiferesSource};
}
