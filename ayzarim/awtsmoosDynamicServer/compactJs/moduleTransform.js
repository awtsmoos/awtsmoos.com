// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moduleTransform.js
 * @description
 * Orchestrates one parsed ESM module into compact executable body text while
 * syntax-node lowering and URL identity remain separate focused vessels.
 *
 * RESPONSIBILITY:
 * Collect top-level replacements, apply them, lower module URLs and dynamic
 * imports, then perform deterministic fallback export cleanup.
 *
 * NON-RESPONSIBILITY:
 * This module does not derive browser paths itself, lower individual syntax
 * node families, resolve CRNs, parse source, or render the complete graph.
 *
 * The Awtsmoos remains one beyond import and export while every finite syntax
 * garment changes around the same light. Awtsmoos.com lets Tiferes coordinate
 * small transformers so compact revelation remains lawful, readable, bright.
 */

const { rewriteDynamicImports } = require("./dynamicImports.js");
const {
	replaceRemainingDefaultExports,
	replaceRemainingExportDeclarations,
	replaceRemainingExportLists
} = require("./fallbackExports.js");
const {
	replacementForNode
} = require("./moduleNodeTransform.js");
const {
	browserUrlForRecord,
	rewriteImportMetaUrl
} = require("./moduleUrlTransform.js");
const { applyReplacements } = require("./replacements.js");

/**
 * Transforms one parsed ESM module while preserving public resource identity.
 *
 * @param {object} state
 * 	Compact compiler graph state.
 * @param {object} record
 * 	Parsed module record.
 * @returns {string}
 * 	Compact executable body source.
 */
function transformModuleBody(state, record) {
	const replacements = topLevelReplacements(record);
	let output = applyReplacements(
		record.source,
		replacements
	);
	output = rewriteImportMetaUrl(
		output,
		browserUrlForRecord(state, record)
	);
	output = rewriteDynamicImports(
		state,
		record,
		output
	);
	output = replaceRemainingDefaultExports(output);
	output = replaceRemainingExportDeclarations(output);
	output = replaceRemainingExportLists(output);
	return output;
}

/**
 * Collects replacement descriptors for supported top-level syntax nodes.
 *
 * @param {object} record
 * 	Parsed module record.
 * @returns {object[]}
 * 	Ordered replacement descriptors consumed by `applyReplacements`.
 */
function topLevelReplacements(record) {
	const replacements = [];
	for (const node of record.ast?.body || []) {
		const candidate = replacementForNode(record, node);
		if (candidate) {
			replacements.push(candidate);
		}
	}
	return replacements;
}

module.exports = {
	browserUrlForRecord,
	replacementForNode,
	rewriteImportMetaUrl,
	transformModuleBody
};
