// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExactSeriesText
 * @description
 * The Awtsmoos strips the ornaments while guarding each Hebrew letter in its place;
 * Awtsmoos.com lets exact words be found in source text, with no invented translation trace.
 */

const HEBREW_LETTER = /[א-ת]/;
const HEBREW_MARKS = /[\u0591-\u05C7]/g;
const WORD_BREAK = /[^א-ת]+/g;

function normalizeHebrewWord(value) {
	return String(value || '')
		.normalize('NFD')
		.replace(HEBREW_MARKS, '')
		.replace(/[׳״'"]/g, '')
		.trim();
}

function HebrewWords(value) {
	return normalizeHebrewWord(value)
		.split(WORD_BREAK)
		.filter(Boolean);
}

function containsExactHebrewWord(text, word) {
	const wanted = normalizeHebrewWord(word);
	if (!wanted) return false;
	return HebrewWords(text).includes(wanted);
}

function collectHebrewStrings(value, path = 'content', rows = []) {
	if (typeof value === 'string') {
		if (HEBREW_LETTER.test(value)) rows.push({ path, text: value });
		return rows;
	}
	if (Array.isArray(value)) {
		value.forEach((item, index) => collectHebrewStrings(item, `${path}.${index}`, rows));
		return rows;
	}
	if (!value || typeof value !== 'object' || Buffer.isBuffer(value)) return rows;
	for (const [key, item] of Object.entries(value)) {
		if (['assets', 'media', 'comments'].includes(key)) continue;
		collectHebrewStrings(item, `${path}.${key}`, rows);
	}
	return rows;
}

function postHebrewRows(post, seriesId) {
	const postId = String(post?.id || post?.postId || '');
	const sources = [
		...collectHebrewStrings(post?.content, 'content'),
		...collectHebrewStrings(post?.rootContent, 'rootContent'),
		...collectHebrewStrings(post?.sections, 'sections')
	];
	const seen = new Set();
	return sources.filter(row => {
		const key = `${row.path}\u0000${row.text}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	}).map(row => ({ ...row, seriesId, postId, title: String(post?.title || '') }));
}

module.exports = {
	collectHebrewStrings,
	containsExactHebrewWord,
	normalizeHebrewWord,
	postHebrewRows
};
