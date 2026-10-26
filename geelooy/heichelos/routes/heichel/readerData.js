//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Minimal public data resolution for first-byte Torah.
 * @description
 * The Awtsmoos draws one teaching from the canonical river without hauling the whole sea;
 * Awtsmoos.com resolves metadata and ordered IDs in parallel, and renders truthful emptiness when an address has no post.
 */

const { postFields, queryMap } = require('./fieldMaps.js');
const { publicReaderCache } = require('./readerDataCache.js');
const { traceAsync } = require('./torahRouteTrace.js');
const { buildChitasVirtualPost, parseChitasPostId } = require('./chitasVirtualPost.js');
const { resolveSeriesPostIdOrNull } = require('./readerSeriesIndex.js');
const { readPostRoute, readPostsRoute } = require('../../../api/social/helper/routes/posts/readers.js');
const { readSeriesDetailsPlain } = require('../../../api/social/helper/routes/series/readRoutesDetails.js');

function encodeSegment(value) {
	return encodeURIComponent(String(value ?? ''));
}

function seriesIndexFields() {
	return queryMap('propertyMap', { id: true, name: true, title: true });
}

function directChildContext($i, search) {
	const child = Object.create(Object.getPrototypeOf($i) || Object.prototype);
	Object.assign(child, $i);
	child.$_GET = Object.fromEntries(new URLSearchParams(search || ''));
	return child;
}

function createReaderData($i) {
	async function fetchDirect(routePath) {
		const url = new URL(routePath, 'http://reader.invalid');
		const seg = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
		if (seg[0] !== 'api' || seg[1] !== 'social' || seg[2] !== 'heichelos' || seg[4] !== 'series') return undefined;
		const heichelId = seg[3];
		const seriesId = seg[5];
		const child = directChildContext($i, url.search);
		let result;
		if (seg[6] === 'post' && seg[7]) result = await readPostRoute({ $i: child, heichelId, seriesId, postId: seg[7] });
		else if (seg[6] === 'posts' && !seg[7]) result = await readPostsRoute({ $i: child, heichelId, seriesId, withDetails: false });
		else if (seg[6] === 'details') result = await readSeriesDetailsPlain(child, heichelId, seriesId);
		else return undefined;
		if (result === null || result === undefined) return null;
		return JSON.parse(JSON.stringify(result));
	}

	async function fetchPublic(routePath, stage, context = {}) {
		return traceAsync(stage, () => publicReaderCache.read(routePath, async () => {
			let response;
			try {
				response = await fetchDirect(routePath);
			} catch (error) {
				console.error('B"H reader direct read failed; using route dispatch:', error?.message || error);
			}
			if (response === undefined) response = await $i.fetchAwtsmoos(routePath);
			return response && !response.error ? response : null;
		}), { ...context, path: routePath });
	}

	function decorate({ heichelId, seriesId = '', postId = '', indexInSeries = '', post = null, series = null }) {
		const heichel = { id: heichelId };
		return {
			heichel,
			heichelId,
			post: post ? { ...post, id: postId || post.id, heichel } : null,
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

	function postsPath(heichelId, seriesId) {
		return `/api/social/heichelos/${encodeSegment(heichelId)}/series/${encodeSegment(seriesId)}/posts`;
	}

	async function loadSeriesPost(heichelId, seriesId, postId, opts = {}) {
		let post = await fetchPublic(postPath(heichelId, seriesId, postId), 'reader-data:post', { heichelId, seriesId, postId });
		if (!post && seriesId === 'daily-chitas' && parseChitasPostId(postId)) {
			post = await traceAsync('reader-data:chitas-virtual-post', () => buildChitasVirtualPost(postId, { israel: !!opts.israel }), { heichelId, seriesId, postId }).catch(() => null);
		}
		return decorate({ heichelId, seriesId, postId, post });
	}

	async function loadDirect(heichelId, postId) {
		return loadSeriesPost(heichelId, 'root', postId);
	}

	async function loadSeriesIndex(heichelId, seriesId, indexInSeries) {
		const base = `/api/social/heichelos/${encodeSegment(heichelId)}/series/${encodeSegment(seriesId)}`;
		const [series, canonicalPosts] = await Promise.all([
			fetchPublic(`${base}/details?${seriesIndexFields()}`, 'reader-data:series', { heichelId, seriesId, indexInSeries }),
			fetchPublic(postsPath(heichelId, seriesId), 'reader-data:posts', { heichelId, seriesId, indexInSeries })
		]);
		const postId = await resolveSeriesPostIdOrNull({ series, indexInSeries, loadCanonicalPosts: async () => canonicalPosts });
		if (!postId) return decorate({ heichelId, seriesId, indexInSeries, series });
		const post = await fetchPublic(postPath(heichelId, seriesId, postId), 'reader-data:post', { heichelId, seriesId, postId });
		return decorate({ heichelId, seriesId, postId, indexInSeries, post, series });
	}

	return { loadDirect, loadSeriesPost, loadSeriesIndex };
}

module.exports = { createReaderData, seriesIndexFields };
