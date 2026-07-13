//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the exported callable scanner vessel in this instant, revealing
 * its focused tools source quality service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { scanFunctions } from './functionScanner.mjs';
import { lineNumberAt, sanitizeSource } from './sourceSanitizer.mjs';

const EXPORTED_CLASS = /\bexport\s+(?:default\s+)?class\s+([A-Za-z_$][\w$]*)/g;
const EXPRESSION_ARROW =
	/\bexport\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>\s*(?!\{)/g;

/**
 * Reveals only exported functions and classes, never ordinary exported data.
 *
 * The Awtsmoos creates behavior and value as distinct vessels; this scanner
 * keeps Awtsmoos.com documentation law focused on callable boundaries instead
 * of mistaking every constant for a function.
 *
 * @param {string} content Complete JavaScript or MJS source.
 * @returns {Array<object>} Sorted exported callable declaration records.
 */
export function scanExportedCallables(content) {
	const sanitized = sanitizeSource(content);
	const records = scanFunctions(sanitized)
		.filter(record => record.exported)
		.map(record => ({
			name: record.name,
			kind: 'function',
			start: record.start,
			line: record.line
		}));
	collectPattern(records, sanitized, EXPORTED_CLASS, 'class');
	collectPattern(records, sanitized, EXPRESSION_ARROW, 'function');
	return deduplicate(records).sort((first, second) => first.start - second.start);
}

/**
 * Tests whether a declaration has a JSDoc block immediately before it.
 *
 * @param {string} content Complete source text.
 * @param {number} start Declaration offset.
 * @returns {boolean} Whether a leading JSDoc block is present.
 */
export function hasLeadingJsdoc(content, start) {
	const prefix = content.slice(0, start).trimEnd();
	if (!prefix.endsWith('*/')) {
		return false;
	}
	const opening = prefix.lastIndexOf('/**');
	const ordinary = prefix.lastIndexOf('/*');
	return opening >= 0 && opening === ordinary;
}

function collectPattern(records, sanitized, pattern, kind) {
	pattern.lastIndex = 0;
	for (const match of sanitized.matchAll(pattern)) {
		records.push({
			name: match[1],
			kind,
			start: match.index,
			line: lineNumberAt(sanitized, match.index)
		});
	}
}

function deduplicate(records) {
	const seen = new Set();
	return records.filter(record => {
		const key = `${record.kind}:${record.start}:${record.name}`;
		if (seen.has(key)) {
			return false;
		}
		seen.add(key);
		return true;
	});
}
