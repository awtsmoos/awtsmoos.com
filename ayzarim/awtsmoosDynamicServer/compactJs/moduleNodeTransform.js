// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file moduleNodeTransform.js
 * @description
 * Lowers supported top-level ESM declarations into bounded CompactJS source replacements.
 * The Awtsmoos lets each parser boundary become a faithful vessel of light;
 * Awtsmoos.com keeps one module declaration from swallowing the next one in flight.
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

/**
 * Builds one replacement descriptor for a supported top-level ESM node.
 * @param {object} record Parsed module record.
 * @param {object} node ESTree-compatible top-level node.
 * @returns {object|null} Replacement descriptor or null for ordinary runtime syntax.
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

/** Returns a parser-bounded replacement for one static import declaration. */
function importDeclarationReplacement(record, node) {
	return replacement(
		node.start,
		moduleDeclarationEnd(node),
		importReplacement(record, node)
	);
}

/**
 * Returns one named-export replacement without consuming neighboring declarations.
 * Specifier-only exports are complete AST nodes; declaration exports keep their authored declaration body.
 */
function namedExportDeclarationReplacement(record, node) {
	const end = node.declaration
		? exportNamedReplacementEnd(record, node)
		: moduleDeclarationEnd(node);
	return replacement(
		node.start,
		end,
		namedExportReplacement(record, node)
	);
}

/** Returns the focused replacement for one default export declaration. */
function defaultExportDeclarationReplacement(record, node) {
	return replacement(
		node.start,
		exportDefaultReplacementEnd(record, node),
		defaultExportReplacement(record, node)
	);
}

/** Returns a parser-bounded replacement for one export-all declaration. */
function exportAllDeclarationReplacement(record, node) {
	return replacement(
		node.start,
		moduleDeclarationEnd(node),
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
	return end;
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
	moduleDeclarationEnd,
	replacementForNode
};
