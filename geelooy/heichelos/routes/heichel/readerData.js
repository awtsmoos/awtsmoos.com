//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Reader data resolution for public Torah posts.
 * @description The Awtsmoos gathers one public teaching before the browser awakens; Awtsmoos.com measures each cold API vessel only when explicit tracing is enabled.
 */
const { aliasFields, heichelFields } = require('./fieldMaps.js');
const { traceAsync } = require('./torahRouteTrace.js');

/** Encodes one public route segment without changing its identity. */
function encodeSegment(value) {
	return encodeURIComponent(String(value ?? ''));
}

/** Resolves an ordered series position into its stable post identity. */
function pickSeriesPostId(series, index) {
	const posts = Array.isArray(series?.posts) ? series.posts : [];
	const numericIndex = Number.parseInt(String(index), 10);
	if (!Number.isInteger(numericIndex) || numericIndex < 0 || numericIndex >= posts.length) return null;
	const entry = posts[numericIndex];
	return typeof entry === 'string' ? entry : entry?.id || entry?.postId || null;
}

/** Creates public reader-data resolvers bound to the dynamic request vessel. */
function createReaderData($i) {
	async function fetchPublic(path, stage, context = {}) {
		return traceAsync(stage, async () => {
			const response = await $i.fetchAwtsmoos(path);
			return response && !response.error ? response : null;
		}, { ...context, path });
	}

	function getHeichel(heichelId) {
		return fetchPublic(
			`/api/social/heichelos/${encodeSegment(heichelId)}?${heichelFields()}`,
			'reader-data:heichel',
			{ heichelId }
		);
	}

	function getAlias(authorId) {
		if (!authorId) return Promise.resolve(null);
		return fetchPublic(
			`/api/social/aliases/${encodeSegment(authorId)}?${aliasFields()}`,
			'reader-data:alias',
			{ authorId }
		).catch(() => null);
	}

	async function decorate({ heichelId, seriesId = '', postId, indexInSeries = '', post, series = null }) {
		const [heichel, alias] = await Promise.all([
			getHeichel(heichelId),
			getAlias(post?.author)
		]);
		if (heichel) heichel.id = heichelId;
		if (alias && post?.author) alias.id = post.author;
		if (post) {
			post.id = postId;
			post.heichel = heichel;
		}
		return { heichel, post, alias, series, parentSeries: seriesId, postId, indexInSeries };
	}

	async function loadDirect(heichelId, postId) {
		const seriesId = 'root';
		const post = await fetchPublic(
			`/api/social/heichelos/${encodeSegment(heichelId)}/series/${seriesId}/post/${encodeSegment(postId)}`,
			'reader-data:post',
			{ heichelId, seriesId, postId }
		);
		return decorate({ heichelId, seriesId, postId, post });
	}

	async function loadSeriesPost(heichelId, seriesId, postId) {
		const post = await fetchPublic(
			`/api/social/heichelos/${encodeSegment(heichelId)}/series/${encodeSegment(seriesId)}/post/${encodeSegment(postId)}`,
			'reader-data:post',
			{ heichelId, seriesId, postId }
		);
		return decorate({ heichelId, seriesId, postId, post });
	}

	async function loadSeriesIndex(heichelId, seriesId, indexInSeries) {
		const series = await fetchPublic(
			`/api/social/heichelos/${encodeSegment(heichelId)}/series/${encodeSegment(seriesId)}/details`,
			'reader-data:series',
			{ heichelId, seriesId, indexInSeries }
		);
		const postId = pickSeriesPostId(series, indexInSeries);
		const post = postId
			? await fetchPublic(
				`/api/social/heichelos/${encodeSegment(heichelId)}/series/${encodeSegment(seriesId)}/post/${encodeSegment(postId)}`,
				'reader-data:post',
				{ heichelId, seriesId, postId }
			)
			: null;
		return decorate({ heichelId, seriesId, postId, indexInSeries, post, series });
	}

	return { loadDirect, loadSeriesPost, loadSeriesIndex };
}

module.exports = { createReaderData, pickSeriesPostId };
