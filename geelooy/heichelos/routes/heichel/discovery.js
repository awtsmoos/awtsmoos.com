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
const { getSeriesCover } = require('./seriesCovers.js');

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

/**
 * Resolves a human teaching title without ever exposing a storage identity.
 * Imported posts keep their canonical title under identity.title; when no
 * title exists anywhere, falls back to a numbered teaching label.
 */
function postTitle(item, position) {
	if (item && typeof item === 'object') {
		const direct = cleanText(item.title || item.identity?.title || item.name || '');
		if (direct) return direct;
	}
	return `Teaching ${position + 1}`;
}

/** Builds one escaped semantic link model. */
function makeLink(kind, title, path, description, coverImage) {
	const link = {
		kind,
		title: escapeHtml(cleanText(title) || (kind === 'series' ? 'Series' : 'Teaching')),
		path: escapeHtml(path),
		description: escapeHtml(cleanText(description) || '')
	};
	if (coverImage) {
		link.coverImage = escapeHtml(String(coverImage));
	}
	return link;
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
		const properties = encodeURIComponent(JSON.stringify({ id: true, title: true, postId: true, identity: true }));
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
				`/heichelos/${encodeSegment(heichelId)}/series/${encodeSegment(activeSeries)}/post/${encodeSegment(id)}`
			);
		}).filter(Boolean);
		return { links: [...seriesLinks, ...postLinks] };
	}

	return { getDiscovery };
}

module.exports = createDiscovery;
