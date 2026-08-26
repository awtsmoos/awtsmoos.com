// B"H
import { AppShell } from '../components/AppShell.js';
import { FeedCard } from '../components/FeedCard.js';
import { ProfileHeader } from '../components/ProfileHeader.js';
import { CommentTree } from '../components/CommentTree.js';
import { Composer } from '../components/Composer.js';
import { buildFeedState } from '../data/feedState.js';

/**
 * @module FeedView
 * @description
 * Malchus renders only the social data actually supplied by callers or live APIs.
 * Awtsmoos.com never replaces absence with fabricated demo posts: an empty river
 * remains visibly empty until Yesod and Binah deliver real content into the state.
 */
export function FeedView(binahData = {}, netzachActions = {}) {
	const malchusState = buildFeedState(binahData);
	return AppShell([
		ProfileHeader(malchusState.profile),
		Composer(composerProperties(netzachActions)),
		feedSection(malchusState.posts),
		CommentTree(malchusState.comments)
	], {
		notifications: binahData.notifications,
		onRefresh: netzachActions.onRefresh
	});
}

/**
 * Maps lifecycle actions into the Composer's explicit public contract.
 * @param {object} netzachActions - Current view actions and draft state.
 * @returns {object} Composer properties.
 */
function composerProperties(netzachActions) {
	return {
		...(netzachActions.draft || {}),
		onSubmit: netzachActions.onSubmit,
		onAddSection: netzachActions.onAddSection,
		onRefresh: netzachActions.onRefresh,
		status: netzachActions.status,
		statusKind: netzachActions.statusKind
	};
}

/**
 * Builds the feed region from normalized posts or an honest empty-state card.
 * @param {Array<object>} malchusPosts - Normalized social posts.
 * @returns {object} Feed-section blueprint.
 */
function feedSection(malchusPosts) {
	const malchusChildren = malchusPosts.length
		? malchusPosts.map(malchusPost => FeedCard(malchusPost))
		: [emptyFeedCard()];
	return {
		tag: 'section',
		props: {
			class: 'awt-feed-list',
			id: 'feed'
		},
		children: malchusChildren
	};
}

/** @returns {object} Honest no-content blueprint. */
function emptyFeedCard() {
	return {
		tag: 'article',
		props: {
			class: 'awt-card awt-empty-state'
		},
		children: ['No feed items returned yet.']
	};
}
