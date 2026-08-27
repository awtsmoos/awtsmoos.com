// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CommentReadUtils
 * @description Pure projection and verse helpers for canonical comment reads.
 */

function names(value) {
	const strip = name => String(name).replace(/\.awtsmoosJSON$/i, '');
	if (Array.isArray(value)) return value.map(strip).filter(Boolean);
	if (value && typeof value === 'object') {
		return Object.keys(value).map(strip).filter(Boolean);
	}
	return [];
}

function resolveVerseSection($i, verseSection) {
	const incoming = verseSection ?? $i.$_GET?.verseSection ?? $i.$_GET?.idx;
	return incoming === undefined || incoming === null || incoming === ''
		? undefined
		: incoming;
}

function parseMap(value) {
	if (!value) return null;
	if (typeof value === 'object') return value;
	try { return JSON.parse(value); } catch { return null; }
}

function projectScalar(value, rule) {
	if (typeof rule === 'number' && typeof value === 'string') {
		return value.slice(0, rule);
	}
	if (typeof rule === 'number' && value && typeof value === 'object') {
		const copy = Array.isArray(value) ? value.slice(0, rule) : { ...value };
		if (typeof copy.text === 'string') copy.text = copy.text.slice(0, rule);
		return copy;
	}
	return value;
}

function projectOne(comment, map) {
	if (!map || !comment || typeof comment !== 'object') return comment;
	const output = {};
	for (const [key, rule] of Object.entries(map)) {
		if (rule === false || rule === undefined || rule === null) continue;
		if (Object.prototype.hasOwnProperty.call(comment, key)) {
			output[key] = projectScalar(comment[key], rule);
		}
	}
	if (comment.verseSection !== undefined
		&& output.verseSection === undefined
		&& map.verseSection !== false) {
		output.verseSection = comment.verseSection;
	}
	return output;
}

function projectComments($i, comments) {
	const map = parseMap($i.$_GET?.propertyMap || $i.$_GET?.properties);
	return map ? comments.map(comment => projectOne(comment, map)) : comments;
}

function withVerse(row, verseSection) {
	if (!row || typeof row !== 'object') return row;
	return {
		...row,
		verseSection: row.verseSection
			?? row.dayuh?.verseSection
			?? verseSection
	};
}

function rowsForSection(object, verseSection) {
	const rows = object && (object[String(verseSection)] ?? object[verseSection]);
	return Array.isArray(rows)
		? rows.map(row => withVerse(row, verseSection))
		: [];
}

function allRows(object) {
	const output = [];
	if (!object || typeof object !== 'object') return output;
	for (const [verseSection, rows] of Object.entries(object)) {
		if (!Array.isArray(rows)) continue;
		for (const row of rows) output.push(withVerse(row, verseSection));
	}
	return output;
}

module.exports = {
	allRows,
	names,
	projectComments,
	resolveVerseSection,
	rowsForSection,
	withVerse
};