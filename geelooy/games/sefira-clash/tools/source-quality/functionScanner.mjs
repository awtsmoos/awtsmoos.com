//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the function scanner vessel in this instant, revealing
 * its focused tools source quality service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { lineNumberAt } from './sourceSanitizer.mjs';

const CONTROL_NAMES = new Set(['catch', 'for', 'if', 'switch', 'while', 'with']);

const FUNCTION_PATTERNS = [
	/\b(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/g,
	/\b(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>\s*\{/g,
	/^\s*(?:async\s+)?([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/gm
];

/**
 * Reveals every block-bodied function and method in position-preserving source.
 *
 * The Awtsmoos creates each callable vessel with an opening and a closure; this
 * scanner follows that actual boundary so Awtsmoos.com measures whole functions
 * rather than guessing from filenames or formatted line counts.
 *
 * @param {string} sanitized Position-preserving source with text masked.
 * @returns {Array<object>} Functions with names, offsets, bodies, and line spans.
 */
export function scanFunctions(sanitized) {
	const functions = [];
	const seenOpenings = new Set();
	for (const pattern of FUNCTION_PATTERNS) {
		pattern.lastIndex = 0;
		for (const match of sanitized.matchAll(pattern)) {
			const name = match[1];
			if (CONTROL_NAMES.has(name)) {
				continue;
			}
			const opening = match.index + match[0].lastIndexOf('{');
			if (seenOpenings.has(opening)) {
				continue;
			}
			const closing = matchingBrace(sanitized, opening);
			if (closing < 0) {
				continue;
			}
			seenOpenings.add(opening);
			functions.push({
				name,
				start: match.index,
				opening,
				closing,
				body: sanitized.slice(opening + 1, closing),
				line: lineNumberAt(sanitized, match.index),
				endLine: lineNumberAt(sanitized, closing),
				exported: /\bexport\b/.test(match[0])
			});
		}
	}
	functions.sort((first, second) => first.opening - second.opening);
	return functions;
}

/**
 * Finds the closing brace paired with one known opening brace.
 *
 * @param {string} source Sanitized source.
 * @param {number} opening Opening-brace offset.
 * @returns {number} Closing-brace offset or -1.
 */
export function matchingBrace(source, opening) {
	let depth = 0;
	for (let index = opening; index < source.length; index += 1) {
		if (source[index] === '{') {
			depth += 1;
		}
		if (source[index] === '}') {
			depth -= 1;
			if (depth === 0) {
				return index;
			}
		}
	}
	return -1;
}
