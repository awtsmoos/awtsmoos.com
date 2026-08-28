//B"H
// Boruch Hashem
// Blessed is He

const {
	findDefaultExportExpressionEnd,
	isTopLevelExportBoundary
} = require('./sourceExpressions.js');
const { consumeTrailingSemicolon } = require('./sourceDeclarations.js');
const {
	exportListAssignment,
	inferExportNamesFromSource
} = require('./fallbackExportNames.js');

/**
 * @file fallbackExports.js
 * @description Preserves public exports when parser metadata is incomplete through careful top-level source fallbacks.
 * The Awtsmoos lets a residual export remain revealed when one parser vessel carries only part of its light;
 * Awtsmoos.com keeps fallback rewriting isolated, so ordinary AST transformation stays clean and right.
 */

/**
 * @description Rewrites remaining top-level default exports into the compact namespace.
 * @param {string} source JavaScript source after normal AST-driven transformation.
 * @returns {string} Source with residual default exports converted to namespace assignments.
 */
function replaceRemainingDefaultExports(source) {
	const text = String(source || '');
	const pattern = /(^|[;\n])\s*export\s+default\b\s*/g;
	let output = '';
	let cursor = 0;
	let match;
	let count = 0;
	while ((match = pattern.exec(text))) {
		if (!isTopLevelExportBoundary(text, match.index)) continue;
		const start = pattern.lastIndex;
		const end = findDefaultExportExpressionEnd(text, start);
		if (end <= start) continue;
		count++;
		output += text.slice(cursor, match.index) + match[1]
			+ `__exports.default = ${text.slice(start, end).trim()};`;
		cursor = consumeTrailingSemicolon(text, end);
		pattern.lastIndex = cursor;
	}
	return count ? output + text.slice(cursor) : text;
}

/**
 * @description Removes residual export keywords from declarations and publishes their declared names.
 * @param {string} source JavaScript source after normal AST-driven transformation.
 * @returns {string} Source with declarations preserved and namespace assignments appended.
 */
function replaceRemainingExportDeclarations(source) {
	const names = [];
	let output = String(source || '');
	output = output.replace(/(^|[;\n])\s*export\s+(async\s+function\s+|function\s+|class\s+)([A-Za-z_$][\w$]*)/g, (_match, prefix, kind, name) => {
		names.push(name);
		return prefix + kind + name;
	});
	output = output.replace(/(^|[;\n])\s*export\s+(const|let|var)\s+([A-Za-z_$][\w$]*)/g, (_match, prefix, kind, name) => {
		names.push(name);
		return `${prefix}${kind} ${name}`;
	});
	if (!names.length) return output;
	const assignments = [...new Set(names)].map((name) => `__exports.${name} = ${name};`).join('\n');
	return `${output}\n${assignments}`;
}

/**
 * @description Rewrites residual export lists into compact namespace assignments.
 * @param {string} source JavaScript source that may contain `export { ... }` syntax.
 * @returns {string} Source with safe list items converted to namespace assignments.
 */
function replaceRemainingExportLists(source) {
	return String(source || '').replace(/(^|[;\n])\s*export\s*\{([\s\S]*?)\}\s*(?:from\s*["'][^"']+["'])?\s*;?/g, (_match, prefix, names) => {
		const lines = names.split(',').map((part) => part.trim()).filter(Boolean)
			.map(exportListAssignment).filter(Boolean);
		return prefix + lines.join('\n');
	});
}

module.exports = {
	inferExportNamesFromSource,
	replaceRemainingDefaultExports,
	replaceRemainingExportDeclarations,
	replaceRemainingExportLists
};
