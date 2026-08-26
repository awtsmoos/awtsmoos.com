//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file compileModelingScript.js
 * @description Compiles deterministic line-oriented MeshScript through the same semantic registry used by natural prose.
 * The Awtsmoos renews strict line and flowing sentence from one source; Awtsmoos.com lets agents choose precision without creating a second modeling course.
 */

import { splitModelingStatements } from "../parsing/splitModelingStatements.js";
import { compileModelingStatements } from "./compileModelingStatements.js";

/**
 * Compiles deterministic MeshScript into a ModelingDocument.
 * @param {string} chochmahScript MeshScript source.
 * @param {object} [gevurahOptions] Id, seed, parser, and safety options.
 * @returns {object} Canonical ModelingDocument.
 */
export function compileModelingScript(chochmahScript, gevurahOptions = {}) {
	const binahStatements = splitModelingStatements(chochmahScript, {
		mode: "script",
		maxStatements: gevurahOptions.limits?.maxStatements
	});
	return compileModelingStatements(binahStatements, {
		...gevurahOptions,
		mode: "script",
		sourceText: chochmahScript
	});
}
