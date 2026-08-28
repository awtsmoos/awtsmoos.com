//B"H
// Boruch Hashem
// Blessed is He

const { collectTopLevelExports } = require('./exportMetadata.js');

/**
 * @file imports.js
 * @description Collects and replaces top-level source-bearing ESM links while preserving backward-compatible import helpers.
 * The Awtsmoos gathers import and re-export doorways without confusing them with export metadata light;
 * Awtsmoos.com keeps source ranges ordered from the end, so each replacement remains stable and right.
 */

/**
 * @description Collects top-level source-bearing import and re-export links from an ESTree-like Program.
 * @param {object} ast ESTree-like Program node.
 * @returns {Array<object>} Source-bearing module link records with authored ranges and specifiers.
 */
function collectTopLevelModuleLinks(ast) {
	if (!ast || !Array.isArray(ast.body)) return [];
	return ast.body
		.filter((node) => node && node.source && typeof node.source.value === 'string')
		.filter((node) => node.type === 'ImportDeclaration' || isSourceExport(node))
		.map((node) => ({
			type: node.type,
			source: node.source.value,
			start: Number(node.start),
			end: Number(node.end),
			specifiers: Array.isArray(node.specifiers) ? node.specifiers : []
		}))
		.filter((item) => typeof item.source === 'string');
}

/**
 * @description Preserves the legacy helper contract by returning only import declarations.
 * @param {object} ast ESTree-like Program node.
 * @returns {Array<object>} Import records with source ranges and specifiers.
 */
function collectTopLevelImports(ast) {
	return collectTopLevelModuleLinks(ast)
		.filter((item) => item.type === 'ImportDeclaration')
		.map((item) => ({ source: item.source, start: item.start, end: item.end, specifiers: item.specifiers }));
}

/**
 * @description Identifies export declarations that point at another module source.
 * @param {object} node ESTree node.
 * @returns {boolean} True for named and star export declarations.
 */
function isSourceExport(node) {
	return node.type === 'ExportNamedDeclaration' || node.type === 'ExportAllDeclaration';
}

/**
 * @description Replaces selected top-level module-link declarations from highest offset to lowest.
 * @param {string} source JavaScript source text.
 * @param {Array<object>} links Source-bearing module links.
 * @param {(link:object)=>boolean} shouldReplace Predicate selecting links to replace.
 * @param {(link:object)=>string} makeReplacement Replacement-source factory.
 * @returns {string} Source with selected declarations replaced without shifting unresolved ranges.
 */
function replaceSelectedModuleLinks(source, links, shouldReplace, makeReplacement) {
	const ranges = links.filter((item) => shouldReplace(item))
		.map((item) => [item.start, item.end, makeReplacement(item)])
		.filter(([start, end]) => Number.isFinite(start) && Number.isFinite(end))
		.sort((a, b) => b[0] - a[0]);
	let output = String(source || '');
	for (const [start, end, replacement] of ranges) {
		output = output.slice(0, start) + replacement + output.slice(end);
	}
	return output;
}

/**
 * @description Removes selected module links while preserving the older predicate-by-source API.
 * @param {string} source JavaScript source text.
 * @param {Array<object>} links Source-bearing module links.
 * @param {(source:string)=>boolean} shouldRemove Predicate selecting authored source specifiers.
 * @returns {string} Source with selected declarations removed.
 */
function removeSelectedModuleLinks(source, links, shouldRemove) {
	return replaceSelectedModuleLinks(source, links, (item) => shouldRemove(item.source), () => '');
}

/**
 * @description Backward-compatible alias for removing selected import records.
 * @param {string} source JavaScript source text.
 * @param {Array<object>} imports Import records.
 * @param {(source:string)=>boolean} shouldRemove Predicate selecting authored import specifiers.
 * @returns {string} Source with selected imports removed.
 */
function removeSelectedImports(source, imports, shouldRemove) {
	return removeSelectedModuleLinks(source, imports, shouldRemove);
}

module.exports = {
	collectTopLevelExports,
	collectTopLevelImports,
	collectTopLevelModuleLinks,
	removeSelectedImports,
	removeSelectedModuleLinks,
	replaceSelectedModuleLinks
};
