//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Server-first discovery links for Heichel and Torah series pages.
 * @description
 * The Awtsmoos joins teaching to teaching through visible doors before JavaScript
 * wakes. Awtsmoos.com uses the same canonical Torah presentation as the browser,
 * preserves stored hierarchy, and naturally orders only teachings whose own titles
 * explicitly declare page numbers.
 */

const { escapeHtml, cleanText } = require('./postSemantic.js');
const { orderTorahPosts } = require('./torahSemanticPolicy.js');
const { prepareTorahSeriesItems } = require('./torahSemanticPresentation.js');

/** Encodes one route segment for a crawlable public path. */
function encodeSegment(value) {
	return encodeURIComponent(String(value ?? ''));
}

/** Normalizes API wrappers into a plain bounded list. */
function normalizeList(value, keys = []) {
	if (Array.isArray(value)) {
		return value;
	}
	for (const key of keys) {
		if (Array.isArray(value?.[key])) {
			return value[key];
		}
	}
	if (Array.isArray(value?.success)) {
		return value.success;
	}
	return [];
}

/** Builds one escaped semantic link model. */
function makeLink(kind, title, path) {
	return {
		kind,
		title: escapeHtml(cleanText(title) || (kind === 'series' ? 'Series' : 'Teaching')),
		path: escapeHtml(path)
	};
}

/**
 * Creates public discovery lookup for a Heichel or one series.
 * @param {object} $i Dynamic Awtsmoos request interface.
 * @returns {{getDiscovery:Function}} Bound discovery resolver.
 */
function createDiscovery($i) {
	/** Fetches one public API path without erasing the shell when unavailable. */
	async function safeFetch(path) {
		try {
			const response = await $i.fetchAwtsmoos(path);
			return response && !response.error ? response : null;
		} catch {
			return null;
		}
	}

	/** Resolves one bounded list of canonical child series and teaching links. */
	async function getDiscovery(heichelId, seriesId = '') {
		const activeSeries = seriesId || 'root';
		const base = `/api/social/heichelos/${encodeSegment(heichelId)}/series/${encodeSegment(activeSeries)}`;
		const properties = encodeURIComponent(JSON.stringify({ id: true, title: true, postId: true }));
		const [subSeriesResponse, postsResponse] = await Promise.all([
			safeFetch(`${base}/subSeries?details=true`),
			safeFetch(`${base}/posts/details?properties=${properties}`)
		]);
		const rawSubSeries = normalizeList(subSeriesResponse, ['series', 'subSeries']);
		const subSeries = await prepareTorahSeriesItems(heichelId, activeSeries, rawSubSeries);
		const rawPosts = normalizeList(postsResponse, ['posts']);
		const posts = orderTorahPosts(heichelId, rawPosts);
		const seriesLinks = subSeries.map(item => makeLink(
			'series',
			item.title || item.name || item.id,
			`/heichelos/${encodeSegment(heichelId)}/series/${encodeSegment(item.id)}`
		));
		const postLinks = posts.map(item => {
			const id = typeof item === 'string' ? item : item?.id || item?.postId;
			const title = typeof item === 'string' ? item : item?.title || id;
			return id ? makeLink(
				'post',
				title,
				`/heichelos/${encodeSegment(heichelId)}/series/${encodeSegment(activeSeries)}/post/${encodeSegment(id)}`
			) : null;
		}).filter(Boolean);
		return { links: [...seriesLinks, ...postLinks] };
	}

	return { getDiscovery };
}

module.exports = createDiscovery;
