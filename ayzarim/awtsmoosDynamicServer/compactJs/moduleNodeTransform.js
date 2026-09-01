// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file moduleNodeTransform.js
 * @description
 * The Awtsmoos lets every static module doorway keep the exact shore already
 * measured by the parser; Awtsmoos.com refuses a later semicolon-searching
 * shadow that could swallow the next import and fracture living names in rhyme.
 *
 * Static imports and source-bearing export garments are complete parser nodes.
 * Declaration exports still use their focused declaration-boundary helpers.
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
 * @param {object} record Parsed CompactJS module record.
 * @param {object} node ESTree-compatible top-level node.
 * @returns {object|null} Replacement descriptor or null for runtime syntax.
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

/** Returns the parser-owned replacement for one complete static import. */
function importDeclarationReplacement(record, node) {
	return replacement(
		node.start,
		staticLinkEnd(node),
		importReplacement(record, node)
	);
}

/** Keeps declaration exports specialized while list/source exports trust parser truth. */
function namedExportDeclarationReplacement(record, node) {
	const end = node.declaration
		? exportNamedReplacementEnd(record, node)
		: staticLinkEnd(node);
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

/** Returns the parser-owned replacement for one complete export-all link. */
function exportAllDeclarationReplacement(record, node) {
	return replacement(
		node.start,
		staticLinkEnd(node),
		exportAllReplacement(record, node)
	);
}

/**
 * Validates the parser boundary for syntax that is already a complete module link.
 * Failing closed is safer than scanning forward into a neighboring declaration.
 */
function staticLinkEnd(node) {
	const start = Number(node?.start);
	const end = Number(node?.end);
	if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
		const error = new Error(`Invalid CompactJS static-link boundary for ${node?.type || "unknown"}.`);
		error.code = "COMPACT_STATIC_LINK_BOUNDARY_INVALID";
		throw error;
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
	replacementForNode
};
