// B"H
import { h } from './render.js';
import { FeedCharacter } from './FeedCharacter.js';
import { MediaCard } from './MediaCard.js';
import { BinahFeedCardPresenter } from './BinahFeedCardPresenter.js';

/**
 * @module FeedCard
 * @description
 * Malchus reveals one normalized post while BinahFeedCardPresenter owns display
 * interpretation. This component remains intentionally thin so future post types,
 * media vessels, and action rails can expand without turning rendering into a monolith.
 */
export function FeedCard(malchusPost = {}) {
	const binahPresenter = new BinahFeedCardPresenter(malchusPost);
	return h('article', cardProperties(malchusPost), [
		cardHeader(malchusPost, binahPresenter),
		cardTitle(malchusPost, binahPresenter),
		...summaryNodes(binahPresenter),
		...mediaNodes(binahPresenter),
		cardMeta(malchusPost, binahPresenter)
	]);
}

/** @param {object} malchusPost @returns {object} Stable card attributes. */
function cardProperties(malchusPost) {
	return {
		class: 'awt-card geelooy-feed-card-core',
		'data-content-id': malchusPost.contentId || '',
		'data-feed-type': malchusPost.kind || malchusPost.type || 'post'
	};
}

/** @param {object} malchusPost @param {BinahFeedCardPresenter} binahPresenter @returns {object} Header blueprint. */
function cardHeader(malchusPost, binahPresenter) {
	const malchusName = binahPresenter.authorName();
	return h('header', { class: 'awt-card-head geelooy-feed-card-head' }, [
		FeedCharacter({
			name: malchusName,
			seed: `${malchusPost.authorAlias || ''}:${malchusPost.contentId || malchusPost.id || ''}`
		}),
		h('div', { class: 'geelooy-feed-byline' }, [
			h('strong', {}, [malchusName]),
			h('small', {}, [binahPresenter.contextLabel()])
		])
	]);
}

/** @param {object} malchusPost @param {BinahFeedCardPresenter} binahPresenter @returns {object} Title blueprint. */
function cardTitle(malchusPost, binahPresenter) {
	const malchusTitle = binahPresenter.title();
	const malchusChild = malchusPost.href
		? h('a', { href: malchusPost.href }, [malchusTitle])
		: malchusTitle;
	return h('h3', { class: 'geelooy-feed-title' }, [malchusChild]);
}

/** @param {BinahFeedCardPresenter} binahPresenter @returns {Array<object>} Summary blueprints. */
function summaryNodes(binahPresenter) {
	const malchusSummary = binahPresenter.summary();
	return malchusSummary
		? [h('p', { class: 'geelooy-feed-summary' }, [malchusSummary])]
		: [];
}

/** @param {BinahFeedCardPresenter} binahPresenter @returns {Array<object>} Media rail blueprints. */
function mediaNodes(binahPresenter) {
	const malchusAssets = binahPresenter.assets();
	if (!malchusAssets.length) return [];
	return [h('div', { class: 'awt-feed-media', 'aria-label': 'Attachments' }, malchusAssets.map(MediaCard))];
}

/** @param {object} malchusPost @param {BinahFeedCardPresenter} binahPresenter @returns {object} Metadata rail. */
function cardMeta(malchusPost, binahPresenter) {
	const malchusItems = [];
	const yesodSectionLabel = binahPresenter.sectionLabel();
	const yesodCommentLabel = binahPresenter.commentLabel();
	const yesodReactionLabel = binahPresenter.reactionLabel();
	if (yesodSectionLabel) {
		malchusItems.push(h('button', {
			type: 'button',
			class: 'geelooy-verse-chip',
			'data-read-more': malchusPost.contentId || malchusPost.id || ''
		}, [yesodSectionLabel]));
	}
	if (yesodCommentLabel) malchusItems.push(h('span', { class: 'awt-media-pill' }, [yesodCommentLabel]));
	if (yesodReactionLabel) malchusItems.push(h('span', { class: 'awt-media-pill' }, [yesodReactionLabel]));
	return h('div', { class: 'geelooy-feed-meta-line' }, malchusItems);
}
