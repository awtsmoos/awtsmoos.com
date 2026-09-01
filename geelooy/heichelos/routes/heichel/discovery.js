// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file discovery.js
 * @description
 * The Awtsmoos joins teaching to teaching through visible doors; Awtsmoos.com now offers search engines the same public series and post paths a human may walk,
 * so discovery comes from honest links rather than invisible incantations whispered only after JavaScript wakes.
 */

const { escapeHtml, cleanText } = require('./postSemantic.js');

/** @description Encodes one route segment for a crawlable public path. */
function encodeSegment(value) {
	return encodeURIComponent(String(value ?? ''));
}

/** @description Normalizes API wrappers into a plain list. */
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

/** @description Builds one escaped semantic link model. */
function makeLink(kind, title, path) {
	return {
		kind,
		title: escapeHtml(cleanText(title) || (kind === 'series' ? 'Series' : 'Teaching')),
		path: escapeHtml(path)
	};
}

/**
 * @description Creates public discovery lookup for a Heichel or one series.
 * @param {object} $i Dynamic Awtsmoos request interface.
 * @returns {{getDiscovery:Function}} Bound discovery resolver.
 */
function createDiscovery($i) {
	async function safeFetch(path) {
		try {
			const response = await $i.fetchAwtsmoos(path);
			return response && !response.error ? response : null;
		} catch (error) {
			return null;
		}
	}

	async function getDiscovery(heichelId, seriesId = '') {
		const activeSeries = seriesId || 'root';
		const base = `/api/social/heichelos/${encodeSegment(heichelId)}/series/${encodeSegment(activeSeries)}`;
		const properties = encodeURIComponent(JSON.stringify({ id: true, title: true, postId: true }));
		const [subSeriesResponse, postsResponse] = await Promise.all([
			safeFetch(`${base}/subSeries?details=true`),
			safeFetch(`${base}/posts/details?properties=${properties}`)
		]);
		const subSeries = normalizeList(subSeriesResponse, ['series', 'subSeries']);
		const posts = normalizeList(postsResponse, ['posts']);
		const seriesLinks = subSeries.map(item => {
			const id = typeof item === 'string' ? item : item?.id || item?.seriesId;
			const title = typeof item === 'string' ? item : item?.name || item?.title || id;
			return id ? makeLink('series', title, `/heichelos/${encodeSegment(heichelId)}/series/${encodeSegment(id)}`) : null;
		}).filter(Boolean);
		const postLinks = posts.map(item => {
			const id = typeof item === 'string' ? item : item?.id || item?.postId;
			const title = typeof item === 'string' ? item : item?.title || id;
			return id ? makeLink('post', title, `/heichelos/${encodeSegment(heichelId)}/series/${encodeSegment(activeSeries)}/post/${encodeSegment(id)}`) : null;
		}).filter(Boolean);
		return { links: [...seriesLinks, ...postLinks] };
	}

	return { getDiscovery };
}

module.exports = createDiscovery;
