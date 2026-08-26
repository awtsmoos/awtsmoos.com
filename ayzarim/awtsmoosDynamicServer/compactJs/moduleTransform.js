//B"H
//Boruch Hashem
//Blessed is He

const path = require("path");
const { rewriteDynamicImports } = require("./dynamicImports.js");
const {
	defaultExportReplacement,
	exportAllReplacement,
	namedExportReplacement
} = require("./exportTransform.js");
const {
	replaceRemainingDefaultExports,
	replaceRemainingExportDeclarations,
	replaceRemainingExportLists
} = require("./fallbackExports.js");
const { importReplacement } = require("./importTransform.js");
const { applyReplacements } = require("./replacements.js");
const {
	exportDefaultReplacementEnd,
	exportNamedReplacementEnd
} = require("./sourceDeclarations.js");
const { findStatementEnd } = require("./sourceExpressions.js");

/**
 * @file Turns one parsed ESM module into compact executable body text while CRN identity remains owned by the graph layer.
 * @description The Awtsmoos lets imports and exports shed syntax garments while runtime meaning remains shining in one module light;
 * Awtsmoos.com orders AST rewriting, resource-URL truth, dynamic CRN folding, and parser fallbacks so semantics remain right.
 */
function transformModuleBody(state, record) {
	const replacements = [];
	for (const node of record.ast?.body || []) {
		const replacement = replacementForNode(record, node);
		if (replacement) {
			replacements.push(replacement);
		}
	}
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

/** Builds one replacement descriptor for a supported top-level ESM syntax node. */
function replacementForNode(record, node) {
	if (node.type === "ImportDeclaration") {
		return replacement(
			node.start,
			statementEnd(record.source, node),
			importReplacement(record, node)
		);
	}
	if (node.type === "ExportNamedDeclaration") {
		return replacement(
			node.start,
			exportNamedReplacementEnd(record, node),
			namedExportReplacement(record, node)
		);
	}
	if (node.type === "ExportDefaultDeclaration") {
		return replacement(
			node.start,
			exportDefaultReplacementEnd(record, node),
			defaultExportReplacement(record, node)
		);
	}
	if (node.type === "ExportAllDeclaration") {
		return replacement(
			node.start,
			statementEnd(record.source, node),
			exportAllReplacement(record, node)
		);
	}
	return null;
}

/** Rewrites import.meta.url to the original public resource URL, never its compact representation URL. */
function rewriteImportMetaUrl(source, browserUrl) {
	return String(source || "").replace(
		/\bimport\.meta\.url\b/g,
		JSON.stringify(browserUrl)
	);
}

/** Returns the canonical browser pathname for the module's real resource identity. */
function browserUrlForRecord(state, record) {
	const relative = path.relative(
		state.rootDir,
		record.filePath
	);
	return `/${relative.split(path.sep).join("/")}`;
}

function statementEnd(source, node) {
	const end = findStatementEnd(source, node.start);
	return end > node.start ? end : node.end;
}

function replacement(start, end, text) {
	return {
		end,
		start,
		text
	};
}

module.exports = {
	browserUrlForRecord,
	replacementForNode,
	rewriteImportMetaUrl,
	transformModuleBody
};
