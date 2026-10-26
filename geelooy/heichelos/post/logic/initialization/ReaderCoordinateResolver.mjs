// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReaderCoordinateResolver
 * @description
 * The Awtsmoos distinguishes a series index from a post identity before browser history can blur them.
 * Awtsmoos.com therefore canonicalizes only coordinates whose ordered teaching vessel truly resolves them.
 */

/** Returns one post identity from the common lightweight entry shapes. */
export function entryPostId(entry) {
	if (typeof entry === 'string') return entry;
	return entry?.id || entry?.postId || null;
}

/** Normalizes array/wrapper/map post collections without inventing entries. */
export function normalizePostEntries(value) {
	if (Array.isArray(value)) return value.filter(Boolean);
	if (!value || typeof value !== 'object') return [];
	for (const key of ['success', 'posts', 'data', 'result']) {
		if (value[key] !== undefined && value[key] !== value) {
			const nested = normalizePostEntries(value[key]);
			if (nested.length) return nested;
		}
	}
	return Object.values(value).filter(entry => entryPostId(entry));
}

/** True only for a nonnegative integer coordinate written as decimal text. */
export function isNumericSeriesCoordinate(value) {
	return /^(?:0|[1-9]\d*)$/.test(String(value ?? ''));
}

function preferredEntries(seriesPosts, canonicalPosts) {
	const embedded = normalizePostEntries(seriesPosts);
	return embedded.length ? embedded : normalizePostEntries(canonicalPosts);
}

/** Resolves route meaning without reading or mutating browser globals. */
export function resolveReaderCoordinate({
	pCoord,
	explicitPostMarker = false,
	seriesPosts = null,
	canonicalPosts = null
}) {
	const coordinate = String(pCoord ?? '');
	const entries = preferredEntries(seriesPosts, canonicalPosts);
	const ids = entries.map(entryPostId);
	if (explicitPostMarker) {
		return { pId: coordinate || null, pIdx: Math.max(0, ids.indexOf(coordinate)) };
	}
	if (isNumericSeriesCoordinate(coordinate)) {
		const pIdx = Number(coordinate);
		return { pId: entryPostId(entries[pIdx]) || null, pIdx };
	}
	return { pId: coordinate || null, pIdx: Math.max(0, ids.indexOf(coordinate)) };
}
