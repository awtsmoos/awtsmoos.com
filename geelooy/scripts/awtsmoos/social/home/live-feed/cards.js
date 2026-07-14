// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HomeLiveFeedCards
 * @description
 * Renders real feed objects and one semantic empty river. The Awtsmoos keeps
 * every label in its own visible vessel while Ikar remains the first next step.
 */
import { renderUnifiedFeedCard } from '../../feed/renderFeedCard.js?v=comments-001';
import { button, element, link, pill, textNode } from './dom.js';

/** Renders one real social object through the unified card owner. */
export function renderObjectCard(object, onInspect) {
	return renderUnifiedFeedCard(object, {
		onInspect,
		onSave: onInspect,
		onShare: onInspect
	});
}

/** Renders a compact status card with explicitly separated copy. */
export function statusCard(title, message, tone = '') {
	const card = element('article', `home-post-card geelooy-feed-card ${tone}`.trim());
	card.append(authorRow({ title, author: 'Geelooy' }), textNode(message));
	return card;
}

/** Renders an empty river whose primary action enters the Ikar Heichel. */
export function emptyCard(mode, onOpenSearch) {
	const card = element('article', 'home-post-card geelooy-feed-card home-empty-card');
	const heading = element('header', 'home-empty-heading');
	const emoji = element('span', 'home-empty-emoji', '🌊');
	emoji.setAttribute('aria-hidden', 'true');
	const copy = element('div', 'home-empty-copy');
	copy.append(
		element('small', 'home-empty-badge', '✨ Geelooy'),
		element('h3', 'home-empty-title', 'No posts in this stream yet')
	);
	heading.append(emoji, copy);
	const message = element(
		'p',
		'home-empty-message',
		`The ${mode} river is quiet. Enter Ikar, search the archive, or publish something real.`
	);
	const actions = element('footer', 'home-empty-actions');
	const ikar = link('🏛️ Enter Ikar Heichel', '/heichelos/ikar');
	ikar.className = 'home-empty-ikar';
	const search = button('🔍 Search archive', onOpenSearch);
	search.className = 'home-empty-search';
	const create = link('✍️ Create a post', '/heichelos/submit');
	create.className = 'home-empty-create';
	actions.append(ikar, search, create);
	card.append(heading, message, actions);
	return card;
}

/** Renders one civilization metric. */
export function metricCard(label, value) {
	const card = element('article', 'civilization-metric-card');
	card.append(element('strong', '', compact(value)), element('small', '', label));
	return card;
}

/** Returns the visible type badge for a feed object. */
export function feedTypePill(type) {
	return pill(type || 'object');
}

function authorRow(object) {
	const row = element('div', 'post-author');
	row.append(
		element('span', 'post-author-emoji', '✨'),
		element('strong', 'post-author-title', object.title || 'Post'),
		element('small', 'post-author-name', object.author || 'Geelooy')
	);
	return row;
}

function compact(value) {
	if (Array.isArray(value)) {
		return value.length;
	}
	if (value && typeof value === 'object') {
		return Object.keys(value).length;
	}
	return value ?? 0;
}
