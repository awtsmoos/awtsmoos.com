// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file readerData.js
 * @description
 * The Awtsmoos gathers one public teaching before the browser awakens; on Awtsmoos.com the same API river that feeds JavaScript now pours into initial HTML,
 * so direct doors and numbered roads reveal one Torah truth without a crawler-only disguise.
 */

const { aliasFields, heichelFields, postFields } = require('./fieldMaps.js');

/** @description Encodes one public route segment without changing its identity. */
function encodeSegment(value) {
	return encodeURIComponent(String(value ?? ''));
}

/**
 * @description Resolves an ordered series position into its stable post identity.
 * @param {object} series Public series details.
 * @param {string|number} index Series position.
 * @returns {string|null} Stable post ID when the position exists.
 */
function pickSeriesPostId(series, index) {
	const posts = Array.isArray(series?.posts) ? series.posts : [];
	const numericIndex = Number.parseInt(String(index), 10);
	if (!Number.isInteger(numericIndex) || numericIndex < 0 || numericIndex >= posts.length) {
		return null;
	}
	const entry = posts[numericIndex];
	return typeof entry === 'string' ? entry : entry?.id || entry?.postId || null;
}

/**
 * @description Creates public reader-data resolvers bound to the dynamic server request vessel.
 * @param {object} $i Dynamic Awtsmoos request interface.
 * @returns {object} Direct, named-series, and numeric-series loaders.
 */
function createReaderData($i) {
	async function fetchPublic(path) {
		const response = await $i.fetchAwtsmoos(path);
		return response && !response.error ? response : null;
	}

	async function getHeichel(heichelId) {
		return fetchPublic(`/api/social/heichelos/${encodeSegment(heichelId)}?${heichelFields()}`);
	}

	async function getAlias(authorId) {
		if (!authorId) {
			return null;
		}
		try {
			return await fetchPublic(`/api/social/aliases/${encodeSegment(authorId)}?${aliasFields()}`);
		} catch (error) {
			return null;
		}
	}

	async function decorate({ heichelId, seriesId = '', postId, indexInSeries = '', post, series = null }) {
		const heichel = await getHeichel(heichelId);
		const alias = await getAlias(post?.author);
		if (heichel) {
			heichel.id = heichelId;
		}
		if (alias && post?.author) {
			alias.id = post.author;
		}
		if (post) {
			post.id = postId;
			post.heichel = heichel;
		}
		return { heichel, post, alias, series, parentSeries: seriesId, postId, indexInSeries };
	}

	async function loadDirect(heichelId, postId) {
		const post = await fetchPublic(
			`/api/social/heichelos/${encodeSegment(heichelId)}/post/${encodeSegment(postId)}?${postFields()}`
		);
		const seriesId = post?.parentSeriesId || post?.seriesId || '';
		return decorate({ heichelId, seriesId, postId, post });
	}

	async function loadSeriesPost(heichelId, seriesId, postId) {
		const post = await fetchPublic(
			`/api/social/heichelos/${encodeSegment(heichelId)}/series/${encodeSegment(seriesId)}/post/${encodeSegment(postId)}`
		);
		return decorate({ heichelId, seriesId, postId, post });
	}

	async function loadSeriesIndex(heichelId, seriesId, indexInSeries) {
		const series = await fetchPublic(
			`/api/social/heichelos/${encodeSegment(heichelId)}/series/${encodeSegment(seriesId)}/details`
		);
		const postId = pickSeriesPostId(series, indexInSeries);
		const post = postId
			? await fetchPublic(`/api/social/heichelos/${encodeSegment(heichelId)}/series/${encodeSegment(seriesId)}/post/${encodeSegment(postId)}`)
			: null;
		return decorate({ heichelId, seriesId, postId, indexInSeries, post, series });
	}

	return { loadDirect, loadSeriesPost, loadSeriesIndex };
}

module.exports = { createReaderData, pickSeriesPostId };
