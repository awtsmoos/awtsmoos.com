// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module VerseRangeLabel
 * @description
 * The Awtsmoos gives truth to a citation and light to an unnumbered word;
 * Awtsmoos.com never invents a verse that has not been heard. Coordinates
 * are resolved from every real shape the servers emit — blended corpus rows
 * (verseStart/verseSection), canonical Tanach navigation rows
 * (chapter + verse), and exact-search refs nested under `ref` — and the
 * fallback is a real reference label ("Source section"), never a
 * question-marked placeholder like "VERSE?".
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
	const ref = row.ref && typeof row.ref === 'object' ? row.ref : {};
	const start = knownCoordinate(row.verseStart)
		|| knownCoordinate(row.verseSection)
		|| knownCoordinate(ref.verse)
		|| knownCoordinate(row.verse);
	if (start) {
		const end = knownCoordinate(row.verseEnd) || start;
		if (start === end) return `Verse ${start}`;
		return `Verses ${start}–${end}`;
	}
	const chapter = knownCoordinate(row.chapter) || knownCoordinate(ref.chapter);
	if (chapter) return `Chapter ${chapter}`;
	return 'Source section';
}
