//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file fallbackExportNames.js
 * @description Infers residual public export names when parser metadata is incomplete.
 * The Awtsmoos reveals names even where a parser vessel carries only a shadow of the source;
 * Awtsmoos.com keeps inference apart from rewriting, so fallback power remains measured at its course.
 */

/**
 * @description Infers public export names from source text for the final browser ESM bridge.
 * @param {string} source JavaScript source that may still contain authored export syntax.
 * @returns {string[]} Unique public names, including default when a residual default export exists.
 */
function inferExportNamesFromSource(source) {
	const names = new Set();
	const text = String(source || '');
	for (const match of text.matchAll(/(?:^|[;\n])\s*export\s+(?:async\s+)?(?:function|class)\s+([A-Za-z_$][\w$]*)/g)) {
		names.add(match[1]);
	}
	for (const match of text.matchAll(/(?:^|[;\n])\s*export\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g)) {
		names.add(match[1]);
	}
	for (const match of text.matchAll(/(?:^|[;\n])\s*export\s*\{([\s\S]*?)\}\s*(?:from\s*["'][^"']+["'])?\s*;?/g)) {
		collectListNames(match[1], names);
	}
	if (/(?:^|[;\n])\s*export\s+default\b/.test(text)) {
		names.add('default');
	}
	return [...names];
}

/**
 * @description Converts one residual export-list item into a namespace assignment.
 * @param {string} part Authored export-list segment such as `local as publicName`.
 * @returns {string} Namespace assignment, or an empty string for unsafe syntax.
 */
function exportListAssignment(part) {
	const alias = part.match(/^([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)$/);
	const local = alias ? alias[1] : part;
	const exported = alias ? alias[2] : part;
	return /^[A-Za-z_$][\w$]*$/.test(local) && /^[A-Za-z_$][\w$]*$/.test(exported)
		? `__exports.${exported} = ${local};`
		: '';
}

/**
 * @description Adds public aliases from one residual export-list body into a Set.
 * @param {string} sourceList Comma-delimited authored export-list body.
 * @param {Set<string>} names Mutable destination set for unique public names.
 * @returns {void} Mutates only the supplied Set.
 */
function collectListNames(sourceList, names) {
	for (const part of sourceList.split(',')) {
		const cleaned = part.trim();
		const alias = cleaned.match(/^(?:[A-Za-z_$][\w$]*|default)\s+as\s+([A-Za-z_$][\w$]*)$/);
		const direct = cleaned.match(/^([A-Za-z_$][\w$]*)$/);
		if (alias) names.add(alias[1]);
		else if (direct && direct[1] !== 'default') names.add(direct[1]);
	}
}

module.exports = {
	exportListAssignment,
	inferExportNamesFromSource
};
