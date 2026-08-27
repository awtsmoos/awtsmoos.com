// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagCommentRowShape
 * @description
 * Normalizes rich and imported comments into one search-facing vessel. The
 * Awtsmoos gives every voice one identity while Awtsmoos.com preserves the
 * source coordinates needed to return from a RAG hit to its canonical comment.
 */

const {
	coordinateId,
	coordinatesFor,
	normalizedDayuh,
	rawVerse
} = require('./commentCoordinates.js');

function normalizeComment(row, extra = {}) {
	if (!row) return null;
	const aliasId = row.aliasId
		|| row.author
		|| row.authorAliasId
		|| row.dayuh?.aliasId
		|| extra.aliasId
		|| '';
	const coordinates = coordinatesFor(row, extra);
	return {
		...row,
		id: row.id,
		aliasId,
		author: row.author || aliasId,
		heichelId: row.heichelId || extra.heichelId || 'ikar',
		seriesId: row.seriesId || extra.seriesId || '',
		postId: row.postId || row.entityId || extra.postId || '',
		verseSection: coordinates.verseSection,
		subsection: coordinates.subSection,
		subsectionId: row.subsectionId || coordinateId(coordinates),
		sourceVerseSection: coordinates.sourceVerseSection,
		sourceSubSection: coordinates.sourceSubSection,
		coordinateBasis: extra.imported ? 'source-one-based-reader-zero-based' : 'native-reader',
		parentType: row.parentType || extra.parentType || 'post',
		dayuh: normalizedDayuh(row, coordinates)
	};
}

function flattenLegacy(value) {
	const rows = [];
	for (const [verseSection, list] of Object.entries(value || {})) {
		if (!Array.isArray(list)) continue;
		for (const row of list) rows.push({ ...row, verseSection: rawVerse(row, verseSection) });
	}
	return rows;
}

function flattenTree(rows) {
	const flattened = [];
	for (const row of Array.isArray(rows) ? rows : []) {
		const { replies, ...comment } = row || {};
		if (comment.id) flattened.push(comment);
		flattened.push(...flattenTree(replies));
	}
	return flattened;
}

function filterContext(rows, context = {}) {
	return rows.filter(row => matchesContext(row, context));
}

function matchesContext(row, context) {
	if (context.aliasId && String(row.aliasId) !== String(context.aliasId)) return false;
	if (context.seriesId && row.seriesId && String(row.seriesId) !== String(context.seriesId)) return false;
	return matchesCoordinate(row, context.verseSection, ['verseSection', 'sourceVerseSection'])
		&& matchesCoordinate(row, context.subSection, ['subsection', 'sourceSubSection']);
}

function matchesCoordinate(row, expected, fields) {
	if (expected == null || expected === '' || expected === 'all') return true;
	return fields.some(field => String(row[field]) === String(expected));
}

function dedupeRows(rows) {
	const byId = new Map();
	for (const row of rows) {
		if (row?.id && !byId.has(String(row.id))) byId.set(String(row.id), row);
	}
	return [...byId.values()];
}

module.exports = {
	dedupeRows,
	filterContext,
	flattenLegacy,
	flattenTree,
	normalizeComment
};
