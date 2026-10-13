// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostRangeResolver
 * @description
 * The Awtsmoos gathers a measured span from canonical posts while leaving every source in its own place;
 * Awtsmoos.com returns the revealed sections with provenance, so comments and future source jumps retain their face.
 */

import { constructPostUrl, constructSeriesDetailsUrl, constructSeriesPostsUrl } from '../initialization/constants.js?v=root-series-context-001';
import { isPostRangeReference } from './rangeReference.js?v=native-reference-post-001';

async function fetchJson(url, label, fetchImpl) {
	const response = await fetchImpl(url);
	if (!response.ok) throw new Error(`${label}: ${response.status}`);
	const payload = await response.json();
	return payload?.success || payload;
}

function postIdOf(entry) {
	if (typeof entry === 'string') return entry.trim() || null;
	return entry?.postId || entry?.id || null;
}

/**
 * Extracts ordered post IDs from a series details vessel.
 * Accepts the legacy array shape and the compact postId-keyed map shape.
 * @returns {Array<string>|null} Ordered post IDs, or null when unusable.
 */
function postIdsFromSeries(series) {
	const posts = series?.posts;
	if (Array.isArray(posts)) {
		const ids = posts.map(postIdOf).filter(Boolean);
		return ids.length ? ids : null;
	}
	if (posts && typeof posts === 'object') {
		const ids = Object.keys(posts).map(key => String(key).trim()).filter(Boolean);
		return ids.length ? ids : null;
	}
	return null;
}

/**
 * Extracts ordered post IDs from a posts listing vessel.
 * @returns {Array<string>|null} Ordered post IDs, or null when unusable.
 */
function postIdsFromListing(listed) {
	const array = Array.isArray(listed) ? listed : (Array.isArray(listed?.posts) ? listed.posts : null);
	if (!array) return null;
	const ids = array.map(postIdOf).filter(Boolean);
	return ids.length ? ids : null;
}

function cloneSection(section) {
	if (Array.isArray(section)) return section.map(value => structuredClone(value));
	return structuredClone(section);
}

/**
 * Resolves a canonical post range without mutating or duplicating the source posts.
 * @param {object} reference Canonical post-range reference.
 * @param {Function} fetchImpl Fetch implementation.
 * @returns {Promise<{sections:Array,sources:Array,series:Object}>} Composed source window.
 */
export async function resolvePostRange(reference, fetchImpl = fetch) {
	if (!isPostRangeReference(reference)) throw new Error('INVALID_POST_RANGE_REFERENCE');
	const series = await fetchJson(
		constructSeriesDetailsUrl(reference.heichelId, reference.seriesId),
		'Range Series Gateway Error',
		fetchImpl
	);
	let postIds = postIdsFromSeries(series);
	if (!postIds) {
		// The details vessel may carry posts as a compact map or omit them;
		// the lightweight posts listing returns the ordered chapter posts.
		const listed = await fetchJson(
			constructSeriesPostsUrl(reference.heichelId, reference.seriesId),
			'Range Series Posts Gateway Error',
			fetchImpl
		);
		postIds = postIdsFromListing(listed);
	}
	if (!postIds) throw new Error('POST_RANGE_SERIES_HAS_NO_POSTS');
	const sections = [];
	const sources = [];
	for (let postIndex = reference.start.postIndex; postIndex <= reference.end.postIndex; postIndex += 1) {
		const postId = postIds[postIndex];
		if (!postId) throw new Error(`POST_RANGE_MISSING_POST_${postIndex}`);
		const post = await fetchJson(
			constructPostUrl(reference.heichelId, reference.seriesId, postId),
			'Range Post Gateway Error',
			fetchImpl
		);
		const sourceSections = Array.isArray(post?.dayuh?.sections) ? post.dayuh.sections : [];
		const start = postIndex === reference.start.postIndex ? reference.start.sectionIndex : 0;
		const end = postIndex === reference.end.postIndex ? reference.end.sectionIndex : sourceSections.length - 1;
		if (start >= sourceSections.length || end >= sourceSections.length) throw new Error('POST_RANGE_SECTION_OUT_OF_BOUNDS');
		for (let sectionIndex = start; sectionIndex <= end; sectionIndex += 1) {
			sections.push(cloneSection(sourceSections[sectionIndex]));
			sources.push({
				heichelId: reference.heichelId,
				seriesId: reference.seriesId,
				postId,
				postIndex,
				sectionIndex,
				verseSection: sectionIndex
			});
		}
	}
	return { sections, sources, series };
}
