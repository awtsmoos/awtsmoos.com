//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReaderSeriesIndex
 * @description
 * The Awtsmoos preserves teaching order and distinguishes an empty address from a broken request;
 * Awtsmoos.com may render a truthful empty reader while malformed indices still speak loudly.
 */

const EXPECTED_ABSENCE_CODES = new Set([
	'READER_SERIES_HAS_NO_POSTS',
	'READER_SERIES_INDEX_MISSING'
]);

/** Returns the creation sequence embedded in legacy post IDs when present. */
function sequenceMillis(entry, fallbackKey = '') {
	const id = typeof entry === 'string' ? entry : entry?.id || entry?.postId || fallbackKey;
	const match = /_(\d{10,})_/.exec(String(id || ''));
	return match ? Number(match[1]) : Number.NaN;
}

/** Normalizes legacy arrays/maps into canonical publish order. */
function orderedEntries(posts) {
	if (Array.isArray(posts)) return posts.filter(Boolean);
	if (!posts || typeof posts !== 'object') return [];
	const ranked = Object.entries(posts).map(([key, entry]) => ({
		key,
		entry,
		ms: sequenceMillis(entry, key)
	}));
	ranked.sort((left, right) => {
		if (Number.isNaN(left.ms) && Number.isNaN(right.ms)) return left.key.localeCompare(right.key);
		if (Number.isNaN(left.ms)) return 1;
		if (Number.isNaN(right.ms)) return -1;
		return left.ms - right.ms || left.key.localeCompare(right.key);
	});
	return ranked.map(item => item.entry).filter(Boolean);
}

/** Extracts one post identity from a list entry. */
function entryPostId(entry) {
	if (typeof entry === 'string') return entry;
	return entry?.id || entry?.postId || null;
}

/** Strictly resolves one numeric series index into a canonical post ID. */
async function resolveSeriesPostId({ series, indexInSeries, loadCanonicalPosts }) {
	const numericIndex = Number.parseInt(String(indexInSeries), 10);
	if (!Number.isInteger(numericIndex) || numericIndex < 0) {
		const error = new Error('READER_SERIES_INDEX_INVALID');
		error.code = 'READER_SERIES_INDEX_INVALID';
		throw error;
	}
	let entries = orderedEntries(series?.posts);
	if (!entries.length) entries = orderedEntries(await loadCanonicalPosts());
	if (!entries.length) {
		const error = new Error('READER_SERIES_HAS_NO_POSTS');
		error.code = 'READER_SERIES_HAS_NO_POSTS';
		throw error;
	}
	const postId = entryPostId(entries[numericIndex]);
	if (!postId) {
		const error = new Error(`READER_SERIES_INDEX_MISSING_${numericIndex}`);
		error.code = 'READER_SERIES_INDEX_MISSING';
		throw error;
	}
	return postId;
}

/** Returns null only for expected empty/out-of-range addresses; all real failures still throw. */
async function resolveSeriesPostIdOrNull(input) {
	try {
		return await resolveSeriesPostId(input);
	} catch (error) {
		if (EXPECTED_ABSENCE_CODES.has(error?.code)) return null;
		throw error;
	}
}

module.exports = {
	EXPECTED_ABSENCE_CODES,
	entryPostId,
	orderedEntries,
	resolveSeriesPostId,
	resolveSeriesPostIdOrNull,
	sequenceMillis
};
