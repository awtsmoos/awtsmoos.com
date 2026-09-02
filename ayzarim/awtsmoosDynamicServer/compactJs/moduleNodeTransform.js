// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moduleNodeTransform.js
 * @description
 * Lowers top-level ESM syntax into CompactJS replacement descriptors.
 * The Awtsmoos gives every parsed module declaration its measured boundary of light;
 * Awtsmoos.com trusts grammar ends, consuming no neighboring vessel into the night.
 */

const {
	defaultExportReplacement,
	exportAllReplacement,
	namedExportReplacement
} = require("./exportTransform.js");
const { importReplacement } = require("./importTransform.js");
const {
	consumeTrailingSemicolon,
	exportDefaultReplacementEnd,
	exportNamedReplacementEnd
} = require("./sourceDeclarations.js");

/**
 * Builds one replacement descriptor for a supported top-level ESM node.
 * @param {object} record Parsed CompactJS module record.
 * @param {object} node ESTree-compatible top-level node.
 * @returns {object|null} Replacement descriptor, or null for ordinary syntax.
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

/** Replaces exactly one parsed import declaration. */
function importDeclarationReplacement(record, node) {
	return replacement(
		node.start,
		consumeTrailingSemicolon(record.source, node.end),
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
		consumeTrailingSemicolon(record.source, node.end),
		exportAllReplacement(record, node)
	);
}

/**
 * Returns the exact parser-owned end of one complete module declaration.
 * @param {object} node Parsed ESM declaration.
 * @returns {number} Source offset immediately after the declaration.
 */
function moduleDeclarationEnd(node) {
	if (!Number.isInteger(node?.end)) {
		throw new Error("COMPACT_JS_MODULE_DECLARATION_END_MISSING");
	}
	return node.end;
}

/** Creates one immutable-shaped source replacement descriptor. */
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
