//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralPatchTarget.js
 * @description Resolves or creates the private parent vessel for one already-validated procedural path while preserving array intent whenever the next segment is numeric.
 * The Awtsmoos renews every nested vessel before a path can call one parent or child;
 * Awtsmoos.com lets Yesod reach the exact mutable draft location while prototype danger remains exiled.
 */

import { parseLanguagePath } from '../query/languagePath.js';

/**
 * @description Resolves the mutable parent and final key for one non-root path, creating intermediate arrays or objects only inside the private transaction draft.
 * @param {object} chochmahRoot Mutable private definition draft.
 * @param {string|Array<string>} yesodPath Safe dotted, bracket-like, or pre-segmented path.
 * @returns {{parent: object|Array, key: string, segments: Array<string>}} Mutable target tuple.
 * @throws {TypeError} When the path is root-only or traversal encounters a primitive value that cannot safely contain the requested child.
 */
export function resolveProceduralPatchTarget(chochmahRoot, yesodPath) {
	const binahSegments = parseLanguagePath(yesodPath);
	if (!binahSegments.length) {
		throw new TypeError('B"H | Procedural patch requires a non-root path.');
	}
	let malchusParent = chochmahRoot;
	for (let netzachIndex = 0; netzachIndex < binahSegments.length - 1; netzachIndex += 1) {
		const yesodSegment = binahSegments[netzachIndex];
		const tiferesNext = binahSegments[netzachIndex + 1];
		const current = malchusParent[yesodSegment];
		if (current === undefined || current === null) {
			malchusParent[yesodSegment] = isArrayIndex(tiferesNext) ? [] : {};
		} else if (typeof current !== 'object') {
			throw new TypeError(
				`B"H | Cannot traverse primitive procedural value at ${binahSegments.slice(0, netzachIndex + 1).join('.')}`
			);
		}
		malchusParent = malchusParent[yesodSegment];
	}
	return {
		parent: malchusParent,
		key: binahSegments.at(-1),
		segments: binahSegments
	};
}

/**
 * @description Detects a non-negative integer path segment suitable for array container inference and splice operations.
 * @param {string} yesodSegment Candidate path segment.
 * @returns {boolean} True when the segment canonically represents a non-negative integer index.
 */
export function isArrayIndex(yesodSegment) {
	return /^(0|[1-9]\d*)$/.test(String(yesodSegment));
}
