// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExactSourceCoordinate
 * @description
 * The Awtsmoos sets each reference in its rightful place of light;
 * Awtsmoos.com never paints a made-up number in the reader's sight.
 */

/**
 * Returns a source-supplied coordinate, or empty for missing metadata.
 * @param {unknown} value - Book/chapter/verse/daf coordinate.
 * @returns {string} A trustworthy string.
 */
function known(value) {
	if (value === null || value === undefined) return '';
	const text = String(value).trim();
	return text === '?' ? '' : text;
}

/**
 * Formats exact Hebrew search references without question-mark placeholders.
 * @param {object} ref - Indexed source location metadata.
 * @param {string} corpus - Tanach, Mishnah, or Talmud search corpus.
 * @returns {string} Honest source name and known coordinates.
 */
export function exactSourceCoordinate(ref = {}, corpus = '') {
	if (corpus === 'tanach') {
		const title = known(ref.bookTitleHebrew) || known(ref.seriesId) || 'Tanach';
		const chapter = known(ref.chapter);
		const verse = known(ref.verse);
		if (chapter && verse) return `${title} ${chapter}:${verse}`;
		if (chapter) return `${title} chapter ${chapter}`;
		return `${title} source section`;
	}
	if (corpus === 'mishnah') {
		const title = known(ref.tractateTitle) || known(ref.seriesId) || 'Mishnah';
		const chapter = known(ref.chapter);
		const mishnah = known(ref.mishnah);
		if (chapter && mishnah) return `${title} ${chapter}:${mishnah}`;
		if (chapter) return `${title} chapter ${chapter}`;
		return `${title} source section`;
	}
	const title = known(ref.tractateTitle) || known(ref.seriesId) || 'Talmud';
	const daf = known(ref.daf);
	const amud = known(ref.amud);
	return [title, daf, amud].filter(Boolean).join(' ');
}
