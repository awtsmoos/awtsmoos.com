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

	async function getDiscovery(heichelId, seriesId = '') {
		const activeSeries = seriesId || 'root';
		const base = `/api/social/heichelos/${encodeSegment(heichelId)}/series/${encodeSegment(activeSeries)}`;
		const properties = encodeURIComponent(JSON.stringify({
			id: true,
			title: true,
			postId: true,
			identity: true
		}));
		const [subSeriesResponse, postsResponse] = await Promise.all([
			safeFetch(`${base}/subSeries?details=true`),
			safeFetch(`${base}/posts/details?properties=${properties}`)
		]);
		const rawSubSeries = normalizeList(subSeriesResponse, ['series', 'subSeries']);
		const subSeries = await prepareTorahSeriesItems(heichelId, activeSeries, rawSubSeries);
		const posts = orderTorahPosts(heichelId, normalizeList(postsResponse, ['posts']));
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
