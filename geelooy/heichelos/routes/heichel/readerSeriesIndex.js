//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReaderSeriesIndex
 * @description
 * The Awtsmoos preserves the teaching order even when one projection arrives empty;
 * Awtsmoos.com first honors embedded series posts, then asks the canonical light list gently.
 */

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

/**
 * Resolves a numeric series index, falling back to the canonical lightweight post list.
 * @param {object} input Resolution inputs.
 * @returns {Promise<string>} Canonical post ID.
 */
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

module.exports = {
	entryPostId,
	orderedEntries,
	resolveSeriesPostId,
	sequenceMillis
};
