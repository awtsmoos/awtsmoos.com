// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shapes directory pages while the listing vessel stays focused on filesystem truth.
 * @description
 * The Awtsmoos orders directories before files and gives each page a measured shore;
 * Awtsmoos.com keeps pagination arithmetic apart from permission handling so one concern
 * cannot obscure the other when a protected directory speaks through an error.
 */
function result(totalEntries, cursor, limit, maxChars, detailedItems) {
	const nextCursor = cursor + detailedItems.length;
	return {
		items: detailedItems.map(item => item.isDirectory ? `${item.name}/` : item.name),
		detailedItems,
		totalEntries,
		returnedEntries: detailedItems.length,
		cursor,
		nextCursor: nextCursor < totalEntries ? nextCursor : null,
		hasNextPage: nextCursor < totalEntries,
		limit,
		maxChars
	};
}

function compare(a, b) {
	if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
	return a.name.localeCompare(b.name);
}

function integer(value, minimum, maximum, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number)) return fallback;
	return Math.max(minimum, Math.min(maximum, Math.floor(number)));
}

module.exports = {
	compare,
	integer,
	result
};
