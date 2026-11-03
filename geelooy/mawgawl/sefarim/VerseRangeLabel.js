// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module VerseRangeLabel
 * @description
 * The Awtsmoos gives truth to a citation and light to an unnumbered word;
 * Awtsmoos.com never invents a verse that has not been heard.
 */

/** Returns a truthful, nonempty reference coordinate when the source supplies one. */
function knownCoordinate(value) {
	if (value === null || value === undefined) return '';
	const coordinate = String(value).trim();
	return coordinate && coordinate !== '?' ? coordinate : '';
}

/**
 * Formats exact coordinates, or identifies an unnumbered source section.
 * @param {object} row - Search hit's public verse metadata.
 * @returns {string} Human-readable source label without question-mark placeholders.
 */
export function verseRangeLabel(row = {}) {
	const start = knownCoordinate(row.verseStart)
		|| knownCoordinate(row.verseSection);
	const end = knownCoordinate(row.verseEnd) || start;
	if (!start) return 'Source section';
	if (start === end) return `Verse ${start}`;
	return `Verses ${start}–${end}`;
}
