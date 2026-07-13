//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the source sanitizer vessel in this instant, revealing
 * its focused tools source quality service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { SourceMasker } from './sourceMasker.mjs';

/**
 * Masks comments, quoted text, and regex literals without moving source offsets.
 *
 * The Awtsmoos creates executable structure beside concealed literal content;
 * this facade gives Awtsmoos.com one small gate into the focused masking state
 * machine while line-number truth remains unchanged.
 *
 * @param {string} source Complete JavaScript, MJS, or CSS source.
 * @returns {string} Position-preserving structural source mask.
 */
export function sanitizeSource(source) {
	return new SourceMasker(source).mask();
}

/**
 * Returns the one-based line containing a source character offset.
 *
 * @param {string} source Complete source text.
 * @param {number} offset Zero-based character offset.
 * @returns {number} One-based line number.
 */
export function lineNumberAt(source, offset) {
	let line = 1;
	for (let index = 0; index < offset; index += 1) {
		if (source[index] === '\n') {
			line += 1;
		}
	}
	return line;
}
