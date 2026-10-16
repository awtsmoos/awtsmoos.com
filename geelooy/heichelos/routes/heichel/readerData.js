//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Minimal public data resolution for first-byte Torah.
 * @description The Awtsmoos asks only for the teaching needed to reveal the page;
 * identity decoration and rich reader metadata awaken later in the browser.
 */
const { postFields, queryMap } = require('./fieldMaps.js');
const { publicReaderCache } = require('./readerDataCache.js');
const { traceAsync } = require('./torahRouteTrace.js');
const { buildChitasVirtualPost, parseChitasPostId } = require('./chitasVirtualPost.js');

function encodeSegment(value) {
	return encodeURIComponent(String(value ?? ''));
}

function seriesIndexFields() {
	return queryMap('propertyMap', {
		id: true,
		name: true,
		title: true,
		posts: true
	});
}

function pickSeriesPostId(series, index) {
	const posts = Array.isArray(series?.posts) ? series.posts : [];
	const numericIndex = Number.parseInt(String(index), 10);
	if (!Number.isInteger(numericIndex) || numericIndex < 0 || numericIndex >= posts.length) return null;
	const entry = posts[numericIndex];
	return typeof entry === 'string' ? entry : entry?.id || entry?.postId || null;
}

function createReaderData($i) {
	async function fetchPublic(path, stage, context = {}) {
		return traceAsync(stage, () => publicReaderCache.read(path, async () => {
			const response = await $i.fetchAwtsmoos(path);
			return response && !response.error ? response : null;
		}), { ...context, path });
	}

	function decorate({ heichelId, seriesId = '', postId, indexInSeries = '', post, series = null }) {
		const heichel = { id: heichelId };
		const decoratedPost = post ? { ...post, id: postId || post.id, heichel } : null;
		return {
			heichel,
			heichelId,
			post: decoratedPost,
			alias: null,
			series,
			parentSeries: seriesId,
			postId,
			indexInSeries
		};
	}

	function postPath(heichelId, seriesId, postId) {
		return `/api/social/heichelos/${encodeSegment(heichelId)}/series/${encodeSegment(seriesId)}/post/${encodeSegment(postId)}?${postFields()}`;
	}

	async function loadDirect(heichelId, postId) {
		const seriesId = 'root';
		const post = await fetchPublic(postPath(heichelId, seriesId, postId), 'reader-data:post', {
			heichelId, seriesId, postId
		});
		return decorate({ heichelId, seriesId, postId, post });
	}

	async function loadSeriesPost(heichelId, seriesId, postId, opts = {}) {
		let post = await fetchPublic(postPath(heichelId, seriesId, postId), 'reader-data:post', {
			heichelId, seriesId, postId
		});
		if (!post && seriesId === 'daily-chitas' && parseChitasPostId(postId)) {
			post = await traceAsync(
				'reader-data:chitas-virtual-post',
				() => buildChitasVirtualPost(postId, { israel: !!opts.israel }),
				{ heichelId, seriesId, postId }
			).catch(() => null);
		}
		return decorate({ heichelId, seriesId, postId, post });
	}

	async function loadSeriesIndex(heichelId, seriesId, indexInSeries) {
		const seriesPath = `/api/social/heichelos/${encodeSegment(heichelId)}/series/${encodeSegment(seriesId)}/details?${seriesIndexFields()}`;
		const series = await fetchPublic(seriesPath, 'reader-data:series', { heichelId, seriesId, indexInSeries });
		const postId = pickSeriesPostId(series, indexInSeries);
		const post = postId ? await fetchPublic(postPath(heichelId, seriesId, postId), 'reader-data:post', {
			heichelId, seriesId, postId
		}) : null;
		return decorate({ heichelId, seriesId, postId, indexInSeries, post, series });
	}

	return { loadDirect, loadSeriesPost, loadSeriesIndex };
}

module.exports = { createReaderData, pickSeriesPostId, seriesIndexFields };
