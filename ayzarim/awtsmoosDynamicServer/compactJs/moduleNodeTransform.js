// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moduleNodeTransform.js
 * @description
 * Converts supported top-level ESM syntax nodes into focused CompactJS source
 * replacement descriptors while the outer transformer owns pipeline order.
 *
 * RESPONSIBILITY:
 * Lower import/export declaration families and discover complete statement
 * boundaries without knowing anything about browser URLs or module graphs.
 *
 * NON-RESPONSIBILITY:
 * This module does not apply replacements, rewrite dynamic imports, lower
 * `import.meta.url`, parse ASTs, or render full compact output.
 *
 * The Awtsmoos is beyond every syntax garment while each finite declaration
 * still needs a measured vessel. Awtsmoos.com lets Gevurah name each boundary
 * so changing letters preserve their living meaning in a cleaner rhyme.
 */

const {
	defaultExportReplacement,
	exportAllReplacement,
	namedExportReplacement
} = require("./exportTransform.js");
const { importReplacement } = require("./importTransform.js");
const {
	exportDefaultReplacementEnd,
	exportNamedReplacementEnd
} = require("./sourceDeclarations.js");
const { findStatementEnd } = require("./sourceExpressions.js");

/**
 * Builds one replacement descriptor for a supported top-level ESM node.
 *
 * @param {object} record
 * 	Parsed module record.
 * @param {object} node
 * 	ESTree-compatible top-level node.
 * @returns {object|null}
 * 	Replacement descriptor, or null for ordinary runtime syntax.
 */
function replacementForNode(record, node) {
	if (node.type === "ImportDeclaration") {
		return importDeclarationReplacement(record, node);
	}
	if (node.type === "ExportNamedDeclaration") {
		return namedExportDeclarationReplacement(record, node);
	}
	if (node.type === "ExportDefaultDeclaration") {
		return defaultExportDeclarationReplacement(record, node);
	}
	if (node.type === "ExportAllDeclaration") {
		return exportAllDeclarationReplacement(record, node);
	}
	return null;
}

/** Returns a replacement descriptor for one static import declaration. */
function importDeclarationReplacement(record, node) {
	return replacement(
		node.start,
		statementEnd(record.source, node),
		importReplacement(record, node)
	);
}

/** Returns a replacement descriptor for one named export declaration. */
function namedExportDeclarationReplacement(record, node) {
	return replacement(
		node.start,
		exportNamedReplacementEnd(record, node),
		namedExportReplacement(record, node)
	);
}

/** Returns a replacement descriptor for one default export declaration. */
function defaultExportDeclarationReplacement(record, node) {
	return replacement(
		node.start,
		exportDefaultReplacementEnd(record, node),
		defaultExportReplacement(record, node)
	);
}

/** Returns a replacement descriptor for one export-all declaration. */
function exportAllDeclarationReplacement(record, node) {
	return replacement(
		node.start,
		statementEnd(record.source, node),
		exportAllReplacement(record, node)
	);
}

/** Returns the lexical end of one complete source statement. */
function statementEnd(source, node) {
	const discoveredEnd = findStatementEnd(source, node.start);
	if (discoveredEnd > node.start) {
		return discoveredEnd;
	}
	return node.end;
}

/** Creates one source replacement descriptor. */
function replacement(start, end, text) {
	return {
		end,
		start,
		text
	};
}

module.exports = {
	replacementForNode
};
