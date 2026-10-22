//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ProfilePagination
 * @description
 * One pagination language for every profile data doorway (Worker N, 2026-10-21).
 *
 * Spec as built:
 *   Query / option params (all optional):
 *     postsLimit, postsCursor, commentsLimit, commentsCursor
 *     (routes also accept the short forms limit/cursor for posts)
 *   Cursor: opaque offset token "o<n>" (a bare non-negative integer is also
 *   accepted). Limit: 1..500.
 *   Response: the legacy fields are untouched in shape; an additive
 *   `pagination` object is attached:
 *     pagination.posts    { total, totalKnown, assembled, returned, offset,
 *                           limit, hasMore, nextCursor }
 *     pagination.comments { same fields }
 *   `total` is exact whenever the assembled set is known complete (assembled
 *   fewer items than the fetch limit that produced it). When assembly hit its
 *   fetch limit, total is null with totalKnown:false and hasMore:true plus a
 *   nextCursor whenever a deeper page exists — truncation is always signaled,
 *   never silent. With NO paging params, items are returned exactly as the
 *   legacy assembly produced them (no slicing) and pagination only reports.
 */

const MAX_PAGE_LIMIT = 500;

function parseCursor(c) {
	if (c == null || c === '') return 0;
	const m = /^o(\d+)$/.exec(String(c));
	if (m) return parseInt(m[1], 10);
	const n = parseInt(c, 10);
	return Number.isFinite(n) && n >= 0 ? n : 0;
}

function parseLimit(v, fallback = null) {
	if (v == null || v === '') return fallback;
	const n = parseInt(v, 10);
	if (!Number.isFinite(n) || n < 1) return fallback;
	return Math.min(n, MAX_PAGE_LIMIT);
}

function cursorFor(offset) { return offset > 0 ? 'o' + offset : null; }

// Normalizes paging options out of a query object (route layer) or a direct
// options object (module layer). Short forms limit/cursor apply to posts.
function pageOptsFrom(source = {}) {
	return {
		postsLimit: source.postsLimit != null ? source.postsLimit : source.limit,
		postsCursor: source.postsCursor != null ? source.postsCursor : source.cursor,
		commentsLimit: source.commentsLimit,
		commentsCursor: source.commentsCursor
	};
}

function hasPaging(opts) {
	return opts.postsLimit != null || opts.postsCursor != null ||
		opts.commentsLimit != null || opts.commentsCursor != null;
}

// How deep an assembly fetch must go to serve a page honestly.
function fetchLimitFor(limit, cursor, legacyDefault) {
	const lim = parseLimit(limit, null);
	if (lim == null) return legacyDefault;
	return Math.max(legacyDefault, parseCursor(cursor) + lim);
}

function pageSlice(items, limitRaw, cursorRaw) {
	const limit = parseLimit(limitRaw, null);
	const offset = parseCursor(cursorRaw);
	if (limit == null) return { items, offset, limit, end: offset + items.length };
	const sliced = items.slice(offset, offset + limit);
	return { items: sliced, offset, limit, end: offset + sliced.length };
}

function pageInfo({ assembled, fetchLimit, slice }) {
	const complete = assembled < fetchLimit;
	const total = complete ? assembled : null;
	const hasMore = slice.end < assembled || !complete;
	return {
		total,
		totalKnown: complete,
		assembled,
		returned: slice.items.length,
		offset: slice.offset,
		limit: slice.limit,
		hasMore,
		// At the assembly boundary with a capped fetch there is still a next
		// page: the cursor points past everything assembled, and the next
		// request deepens the assembly fetch to serve it.
		nextCursor: slice.end < assembled
			? cursorFor(slice.end)
			: (!complete && slice.end > 0 ? cursorFor(slice.end) : null),
		upstreamFetchLimit: fetchLimit
	};
}

// Applies paging to an assembled profile-shaped object ({posts, comments, ...}).
// fetch = { postsFetchLimit, commentsFetchLimit } — the limits the assembly
// itself was produced with (needed to judge total completeness honestly).
function applyProfilePagination(data, opts = {}, fetch = {}) {
	if (!data || typeof data !== 'object') return data;
	const posts = Array.isArray(data.posts) ? data.posts : [];
	const comments = Array.isArray(data.comments) ? data.comments : [];
	const pSlice = pageSlice(posts, opts.postsLimit, opts.postsCursor);
	const cSlice = pageSlice(comments, opts.commentsLimit, opts.commentsCursor);
	return {
		...data,
		posts: pSlice.items,
		comments: cSlice.items,
		pagination: {
			posts: pageInfo({ assembled: posts.length, fetchLimit: fetch.postsFetchLimit ?? posts.length + 1, slice: pSlice }),
			comments: pageInfo({ assembled: comments.length, fetchLimit: fetch.commentsFetchLimit ?? comments.length + 1, slice: cSlice })
		}
	};
}

module.exports = {
	MAX_PAGE_LIMIT,
	parseCursor,
	parseLimit,
	cursorFor,
	pageOptsFrom,
	hasPaging,
	fetchLimitFor,
	applyProfilePagination
};
