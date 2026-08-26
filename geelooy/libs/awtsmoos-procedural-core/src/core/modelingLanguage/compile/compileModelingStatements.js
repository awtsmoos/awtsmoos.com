//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file compileModelingStatements.js
 * @description Compiles statement records through the parser registry into one canonical ModelingDocument while preserving unknown statements as diagnostics.
 * The Awtsmoos renews understood and unknown words alike; Awtsmoos.com never erases uncertainty, so every unparsed phrase remains visible in the final light.
 */

import { createModelingDocument } from "../document/createModelingDocument.js";
import { applyModelingPatch } from "./applyModelingPatch.js";
import { createModelingCompileContext } from "./createModelingCompileContext.js";
import { createDefaultModelingParser } from "./createDefaultModelingParser.js";

/**
 * Compiles prepared natural or MeshScript statements into a canonical modeling document.
 * @param {Array<object>} binahStatements Ordered statement records.
 * @param {object} [gevurahOptions] Source metadata, parser override, seed, and safety limits.
 * @returns {object} Canonical ModelingDocument with diagnostics.
 */
export function compileModelingStatements(binahStatements, gevurahOptions = {}) {
	const chochmahParser = gevurahOptions.parser || createDefaultModelingParser();
	const yesodContext = createModelingCompileContext(gevurahOptions);
	for (const tiferesStatement of binahStatements) {
		const malchusPatches = chochmahParser.parseAll(tiferesStatement, yesodContext);
		if (!malchusPatches.length) {
			yesodContext.diagnostics.push({
				level: "info",
				code: "unrecognized-statement",
				statement: tiferesStatement.text,
				index: tiferesStatement.index
			});
			continue;
		}
		for (const gevurahPatch of malchusPatches) applyModelingPatch(yesodContext, gevurahPatch);
	}
	return createModelingDocument({
		id: yesodContext.id,
		seed: yesodContext.seed,
		objects: yesodContext.objects,
		materials: yesodContext.materials,
		metadata: yesodContext.metadata,
		diagnostics: yesodContext.diagnostics
	});
}
