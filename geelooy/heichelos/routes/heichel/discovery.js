//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Server-first discovery links for Heichel and Torah series pages.
 * @description The Awtsmoos opens canonical doors before JavaScript wakes,
 * while one bounded cache lets nearby readers share the same public discovery light.
 */
const { escapeHtml, cleanText } = require('./postSemantic.js');
const { publicReaderCache } = require('./readerDataCache.js');
const { orderTorahPosts } = require('./torahSemanticPolicy.js');
const { prepareTorahSeriesItems } = require('./torahSemanticPresentation.js');
const { getSeriesCover } = require('./seriesCovers.js');
const { allHeichelDiscoveryIds } = require('../../../api/social/helper/profile/heichelDiscoveryIds.js');
const { memoizedRead } = require('../../../api/social/helper/profile/readCache.js');

// B"H 2026-11-24 (heichel page perf): window-post probes run in bounded
// parallel batches. The winner is still the lowest-index candidate whose
// probe succeeds — batches are checked in candidate order and the scan
// stops at the first batch containing a success — so the resolved window
// (and therefore the rendered links) is exactly the one the old
// one-by-one scan produced, only sooner.
const WINDOW_PROBE_BATCH = 12;

function encodeSegment(value) {
	return encodeURIComponent(String(value ?? ''));
}

function normalizeList(value, keys = []) {
	if (Array.isArray(value)) return value;
	for (const key of keys) {
		if (Array.isArray(value?.[key])) return value[key];
	}
	return Array.isArray(value?.success) ? value.success : [];
}

function postTitle(item, position) {
	if (item && typeof item === 'object') {
		const direct = cleanText(item.title || item.identity?.title || item.name || '');
		if (direct) return direct;
	}
	return `Teaching ${position + 1}`;
}

function makeLink(kind, title, path, description, coverImage) {
	const link = {
		kind,
		title: escapeHtml(cleanText(title) || (kind === 'series' ? 'Series' : 'Teaching')),
		path: escapeHtml(path),
		description: escapeHtml(cleanText(description) || '')
	};
	if (coverImage) link.coverImage = escapeHtml(String(coverImage));
	return link;
}

function createDiscovery($i) {
	async function safeFetch(path) {
		try {
			return await publicReaderCache.read(`discovery:${path}`, async () => {
				const response = await $i.fetchAwtsmoos(path);
				return response && !response.error ? response : null;
			});
		} catch {
			return null;
		}
	}

	/**
	 * A window series carries the post index but not the post records:
	 * its own details list comes back empty while the plain index sings
	 * (e.g. ikar's bavli-daf window onto the Bavli heichel). Find the
	 * heichel that actually serves a sample post and borrow its details,
	 * so the window lists real titles with links that open. Normal
	 * series never reach this path — their details are non-empty.
	 */
	async function scanWindowPosts(heichelId, activeSeries, ids, properties) {
		let candidates = [];
		try {
			candidates = await allHeichelDiscoveryIds($i);
		} catch {
			candidates = [];
		}
		const probeable = candidates.filter(candidate => candidate && candidate !== heichelId);
		for (let start = 0; start < probeable.length; start += WINDOW_PROBE_BATCH) {
			const batch = probeable.slice(start, start + WINDOW_PROBE_BATCH);
			const probes = await Promise.all(batch.map(candidate => {
				const canonBase = '/api/social/heichelos/' + encodeSegment(candidate) + '/series/' + encodeSegment(activeSeries);
				return safeFetch(canonBase + '/post/' + encodeSegment(ids[0]));
			}));
			const winnerIndex = probes.findIndex(probe => Boolean(probe));
			if (winnerIndex === -1) continue;
			const candidate = batch[winnerIndex];
			const canonBase = '/api/social/heichelos/' + encodeSegment(candidate) + '/series/' + encodeSegment(activeSeries);
			const details = normalizeList(await safeFetch(canonBase + '/posts/details?properties=' + properties), ['posts']);
			if (details.length) {
				return { heichelId: candidate, posts: orderTorahPosts(candidate, details) };
			}
			return {
				heichelId: candidate,
				posts: ids.map(id => ({ id, title: /^BH_POST_/.test(id) ? '' : id }))
			};
		}
		return null;
	}

	async function resolveWindowPosts(heichelId, activeSeries, base, properties) {
		const indexResponse = await safeFetch(base + '/posts');
		const ids = normalizeList(indexResponse, ['posts'])
			.map(item => typeof item === 'string' ? item : item?.id || item?.postId)
			.filter(Boolean);
		if (!ids.length) return null;
		// B"H 2026-11-24 (heichel page perf): the scan below probes every
		// other heichel for the window's first post. For series no other
		// heichel serves under this series id (measured: the root series
		// of the imported heichelos, whose post index lists ids their own
		// details leg answers empty) every probe fails — and because a
		// failed probe reads as null, the reader cache never stored the
		// outcome, so all ~205 probes re-ran sequentially on EVERY page
		// render (~5s warm, the bulk of the page's server time, while the
		// page's own data legs answer in ~0.1–1s). Memoize the resolved
		// outcome — including the null outcome — for 45s with in-flight
		// coalescing (the profile readCache pattern), so repeat renders
		// share one scan and a genuine window still resolves identically
		// within the same freshness window the reader cache already uses.
		const memoKey = `windowPosts:${heichelId}:${activeSeries}:${ids[0]}:${ids.length}`;
		return memoizedRead(memoKey, () => scanWindowPosts(heichelId, activeSeries, ids, properties));
	}

	async function getDiscovery(heichelId, seriesId = '') {
		const activeSeries = seriesId || 'root';
		const base = `/api/social/heichelos/${encodeSegment(heichelId)}/series/${encodeSegment(activeSeries)}`;
		const properties = encodeURIComponent(JSON.stringify({
			id: true,
			title: true,
			postId: true,
			identity: true
		}));
		// B"H 2026-11-11 (batch 29, user order): the section list renders from
		// the LIGHT projection (child names + descriptions only). The details
		// aggregation this used before is refused by the read shed under
		// memory pressure, and its failure was swallowed into a blank page.
		const [subSeriesResponse, postsResponse] = await Promise.all([
			safeFetch(`${base}/subSeries?light=true`),
			safeFetch(`${base}/posts/details?properties=${properties}`)
		]);
		const rawSubSeries = normalizeList(subSeriesResponse, ['series', 'subSeries']);
		const subSeries = await prepareTorahSeriesItems(heichelId, activeSeries, rawSubSeries);
		let posts = orderTorahPosts(heichelId, normalizeList(postsResponse, ['posts']));
		let linkHeichelId = heichelId;
		if (!posts.length) {
			const resolved = await resolveWindowPosts(heichelId, activeSeries, base, properties);
			if (resolved) {
				posts = resolved.posts;
				linkHeichelId = resolved.heichelId;
			}
		}
		const seriesLinks = subSeries.map(item => makeLink(
			'series',
			item.title || item.name || item.id,
			`/heichelos/${encodeSegment(heichelId)}/series/${encodeSegment(item.id)}`,
			item.description || '',
			item.coverImage || getSeriesCover(item.id)
		));
		const postLinks = posts.map((item, position) => {
			const id = typeof item === 'string' ? item : item?.id || item?.postId;
			if (!id) return null;
			return makeLink(
				'post',
				postTitle(item, position),
				`/heichelos/${encodeSegment(linkHeichelId)}/series/${encodeSegment(activeSeries)}/post/${encodeSegment(id)}`
			);
		}).filter(Boolean);
		const links = [...seriesLinks, ...postLinks];
		// B"H 2026-11-11 (batch 29): a failed child read must never again
		// render as a silently blank section. When the list fetch itself
		// failed (null), say so on the page; a series that genuinely has no
		// children and no posts stays a plain empty list.
		// B"H 2026-11-20 (ikar series round 2): the batch-29 note watched
		// only the subSeries fetch. A failed POSTS fetch beside a healthy
		// (often empty) subSeries list rendered the exact silent void the
		// rule exists to prevent -- the ikar Mittler Rebbe series page:
		// hero over blank cream, no list, no note. Watch both fetches: a
		// null response means the read failed, never that the series is
		// empty.
		if (!links.length && (subSeriesResponse === null || postsResponse === null)) {
			return {
				links,
				note: 'This section could not be loaded just now — the library is under heavy load. Please reload the page in a moment.'
			};
		}
		return { links };
	}

	return { getDiscovery };
}

module.exports = createDiscovery;
