// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChronologicalPagination
 * @description The Awtsmoos creates every instant without shifting yesterday's identity; Awtsmoos.com anchors latest-feed
 * pagination to the last real `(timestamp,id)` vessel, while still accepting the older offset cursor during migration.
 */
function timestampOf(item = {}) {
	const source = item.source || {};
	return Number(item.createdAt || item.time || source.createdAt || source.timestamp || 0) || 0;
}

function idOf(item = {}) {
	const source = item.source || {};
	return String(source.postId || source.entityId || source.id || item.entityId || item.id || '');
}

function stableSort(items = []) {
	return [...items].sort((left, right) => {
		const timeDelta = timestampOf(right) - timestampOf(left);
		if (timeDelta) return timeDelta;
		return idOf(right).localeCompare(idOf(left));
	});
}

function decodeCursor(cursor = '') {
	if (!cursor) return null;
	try {
		const parsed = JSON.parse(Buffer.from(String(cursor), 'base64url').toString('utf8'));
		if (parsed.v === 2 && Number.isFinite(Number(parsed.timestamp)) && parsed.id !== undefined) {
			return { version: 2, timestamp: Number(parsed.timestamp), id: String(parsed.id) };
		}
		if (Number.isFinite(Number(parsed.offset))) return { version: 1, offset: Math.max(0, Number(parsed.offset)) };
	} catch {}
	return null;
}

function encodeCursor(item) {
	return Buffer.from(JSON.stringify({
		v: 2,
		timestamp: timestampOf(item),
		id: idOf(item)
	})).toString('base64url');
}

function afterTuple(items, cursor) {
	if (!cursor || cursor.version !== 2) return items;
	return items.filter(item => {
		const timestamp = timestampOf(item);
		if (timestamp < cursor.timestamp) return true;
		if (timestamp > cursor.timestamp) return false;
		return idOf(item).localeCompare(cursor.id) < 0;
	});
}

function paginateChronological(items = [], query = {}, defaults = {}) {
	const limit = Math.max(1, Math.min(defaults.max || 100, Number(query.limit) || defaults.limit || 25));
	const sorted = stableSort(items);
	const cursor = decodeCursor(query.cursor);
	const eligible = cursor?.version === 1 ? sorted.slice(cursor.offset) : afterTuple(sorted, cursor);
	const page = eligible.slice(0, limit);
	return {
		items: page,
		pageInfo: {
			limit,
			cursor: query.cursor || '',
			nextCursor: page.length && eligible.length > page.length ? encodeCursor(page.at(-1)) : '',
			hasMore: eligible.length > page.length,
			total: sorted.length,
			cursorVersion: 2
		}
	};
}

module.exports = { afterTuple, decodeCursor, encodeCursor, idOf, paginateChronological, stableSort, timestampOf };
