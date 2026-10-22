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
const { readPostRoute } = require('../../../api/social/helper/routes/posts/readers.js');
const { readSeriesDetailsPlain } = require('../../../api/social/helper/routes/series/readRoutesDetails.js');

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

/**
 * Builds a child request context for a direct in-process read: same
 * prototype and own properties as the live $i (db, user, dependencies),
 * with only $_GET shadowed by the target path's query string.
 */
function directChildContext($i, search) {
	const child = Object.create(Object.getPrototypeOf($i) || Object.prototype);
	Object.assign(child, $i);
	child.$_GET = Object.fromEntries(new URLSearchParams(search || ''));
	return child;
}

function createReaderData($i) {
	/**
	 * F1 cure (perf crew, 2026-10-22): resolve public reads DIRECTLY through
	 * the social API's own route readers instead of re-entering the whole
	 * request pipeline via $i.fetchAwtsmoos (mock request -> onRequest ->
	 * routing/session/middleware -> route -> JSON stringify -> JSON parse).
	 * The direct result passes through one JSON round-trip so the reader
	 * cache keeps an owned, wire-identical snapshot. Any failure falls back
	 * to the legacy dispatch, unchanged.
	 * Returns undefined only for path shapes this resolver does not own.
	 */
	async function fetchDirect(path) {
		const url = new URL(path, 'http://reader.invalid');
		const seg = url.pathname.split('/').filter(Boolean).map(s => decodeURIComponent(s));
		if (seg[0] !== 'api' || seg[1] !== 'social' || seg[2] !== 'heichelos' || seg[4] !== 'series') return undefined;
		const heichelId = seg[3];
		const seriesId = seg[5];
		const child = directChildContext($i, url.search);
		let result;
		if (seg[6] === 'post' && seg[7]) {
			result = await readPostRoute({ $i: child, heichelId, seriesId, postId: seg[7] });
		} else if (seg[6] === 'details') {
			result = await readSeriesDetailsPlain(child, heichelId, seriesId);
		} else {
			return undefined;
		}
		if (result === null || result === undefined) return null;
		return JSON.parse(JSON.stringify(result));
	}

	async function fetchPublic(path, stage, context = {}) {
		return traceAsync(stage, () => publicReaderCache.read(path, async () => {
			let response;
			try {
				response = await fetchDirect(path);
			} catch (error) {
				console.error('B"H reader-data direct read failed, falling back to dispatch:', (error && error.message) || error);
				response = undefined;
			}
			if (response === undefined) {
				response = await $i.fetchAwtsmoos(path);
			}
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
