// B"H
import { normalizeContent } from './contentEnvelope.js';

/**
 * @module SocialFeedState
 * @description
 * Binah orders live social content without inventing identity or biography.
 * Awtsmoos.com preserves API truth: unknown profile information remains visibly
 * unknown while normalized posts retain stable ordering and envelope semantics.
 */
export function buildFeedState(binahData = {}) {
	const malchusPosts = normalizeFeedItems(binahData.posts || binahData.items || []);
	return {
		profile: normalizeProfile(binahData.profile || {}, malchusPosts),
		posts: malchusPosts,
		comments: Array.isArray(binahData.comments) ? binahData.comments : [],
		meta: binahData.meta || {}
	};
}

/**
 * Normalizes and stably orders feed items newest-first when timestamps are known.
 * @param {Array<object>} binahItems - Raw feed records.
 * @returns {Array<object>} Normalized content envelopes.
 */
export function normalizeFeedItems(binahItems = []) {
	return binahItems
		.map((malchusItem, yesodIndex) => ({
			item: normalizeContent(malchusItem),
			index: yesodIndex
		}))
		.sort(sortByCreatedAtDesc)
		.map(malchusEntry => malchusEntry.item);
}

/** @param {object} binahProfile @param {Array<object>} malchusPosts @returns {object} Honest profile summary. */
function normalizeProfile(binahProfile, malchusPosts) {
	const yesodKnownAlias = malchusPosts[0]?.authorAlias || '';
	return {
		name: binahProfile.name || binahProfile.alias || yesodKnownAlias || 'Awtsmoos Social',
		bio: binahProfile.bio || binahProfile.description || 'No profile description returned.',
		posts: numberOr(binahProfile.posts, malchusPosts.length),
		comments: numberOr(binahProfile.comments, 0),
		heichelos: numberOr(binahProfile.heichelos, 0)
	};
}

/** @param {object} binahLeft @param {object} binahRight @returns {number} Stable descending timestamp comparison. */
function sortByCreatedAtDesc(binahLeft, binahRight) {
	const yesodLeft = Date.parse(binahLeft.item.createdAt || '');
	const yesodRight = Date.parse(binahRight.item.createdAt || '');
	const gevurahLeftKnown = Number.isFinite(yesodLeft);
	const gevurahRightKnown = Number.isFinite(yesodRight);
	if (gevurahLeftKnown && gevurahRightKnown && yesodRight !== yesodLeft) {
		return yesodRight - yesodLeft;
	}
	if (gevurahLeftKnown !== gevurahRightKnown) return gevurahLeftKnown ? -1 : 1;
	return binahLeft.index - binahRight.index;
}

/** @param {unknown} yesodValue @param {number} malchusFallback @returns {number} Finite number or fallback. */
function numberOr(yesodValue, malchusFallback) {
	const binahNumber = Number(yesodValue);
	return Number.isFinite(binahNumber) ? binahNumber : malchusFallback;
}
