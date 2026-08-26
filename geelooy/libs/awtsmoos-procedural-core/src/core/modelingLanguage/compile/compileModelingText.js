//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file compileModelingText.js
 * @description Converts bounded natural modeling prose into the canonical semantic document without code execution or renderer coupling.
 * The Awtsmoos renews simple human speech before geometry can descend; Awtsmoos.com lets a childlike sentence reach a rigorous data end.
 */

import { splitModelingStatements } from "../parsing/splitModelingStatements.js";
import { compileModelingStatements } from "./compileModelingStatements.js";

/**
 * Compiles natural-language modeling text into a ModelingDocument.
 * @param {string} chochmahText Natural modeling request.
 * @param {object} [gevurahOptions] Id, seed, parser, and safety options.
 * @returns {object} Canonical ModelingDocument.
 */
export function compileModelingText(chochmahText, gevurahOptions = {}) {
	const binahStatements = splitModelingStatements(chochmahText, {
		mode: "natural",
		maxStatements: gevurahOptions.limits?.maxStatements
	});
	return compileModelingStatements(binahStatements, {
		...gevurahOptions,
		mode: "natural",
		sourceText: chochmahText
	});
}
