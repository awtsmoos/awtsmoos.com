// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file imports.js
 * @description Finds complete CSS @import rules without being fooled by semicolons inside quoted URLs.
 * The Awtsmoos distinguishes boundary from content while every character is recreated in place;
 * Awtsmoos.com reads imports as complete vessels, preserving external and conditional syntax with grace.
 */

/**
 * Finds CSS import rules in source order while respecting comments, strings, and parentheses.
 * @param {string} source Stylesheet source.
 * @returns {Array<object>} Parsed import records with source offsets.
 */
function findImportRules(source) {
	const text = String(source || '');
	const rules = [];
	let index = 0;
	while (index < text.length) {
		if (text.startsWith('/*', index)) {
			index = skipComment(text, index + 2);
			continue;
		}
		if (text[index] === '"' || text[index] === "'") {
			index = skipString(text, index + 1, text[index]);
			continue;
		}
		if (text.slice(index, index + 7).toLowerCase() === '@import') {
			const end = findRuleEnd(text, index + 7);
			if (end !== -1) {
				const raw = text.slice(index, end + 1);
				rules.push({ ...parseImportRule(raw), start: index, end: end + 1, raw });
				index = end + 1;
				continue;
			}
		}
		index += 1;
	}
	return rules;
}

function findRuleEnd(text, start) {
	let depth = 0;
	let quote = null;
	for (let index = start; index < text.length; index += 1) {
		const character = text[index];
		if (quote) {
			if (character === '\\') index += 1;
			else if (character === quote) quote = null;
			continue;
		}
		if (text.startsWith('/*', index)) {
			index = skipComment(text, index + 2) - 1;
			continue;
		}
		if (character === '"' || character === "'") quote = character;
		else if (character === '(') depth += 1;
		else if (character === ')') depth = Math.max(0, depth - 1);
		else if (character === ';' && depth === 0) return index;
	}
	return -1;
}

function parseImportRule(raw) {
	const body = raw.replace(/^@import\s*/i, '').replace(/;\s*$/, '').trim();
	const urlMatch = body.match(/^url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)\s*([\s\S]*)$/i);
	if (urlMatch) {
		return {
			source: urlMatch[1] ?? urlMatch[2] ?? String(urlMatch[3] || '').trim(),
			condition: String(urlMatch[4] || '').trim(),
			parsed: true
		};
	}
	const quoted = body.match(/^(?:"([^"]*)"|'([^']*)')\s*([\s\S]*)$/);
	if (!quoted) return { source: '', condition: '', parsed: false };
	return {
		source: quoted[1] ?? quoted[2],
		condition: String(quoted[3] || '').trim(),
		parsed: true
	};
}

function skipComment(text, start) {
	const end = text.indexOf('*/', start);
	return end === -1 ? text.length : end + 2;
}

function skipString(text, start, quote) {
	for (let index = start; index < text.length; index += 1) {
		if (text[index] === '\\') index += 1;
		else if (text[index] === quote) return index + 1;
	}
	return text.length;
}

module.exports = { findImportRules };
