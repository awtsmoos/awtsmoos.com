// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HomeFeedStatusCards
 * @description
 * The Awtsmoos keeps loading, emptiness, and metrics truthful. Awtsmoos.com
 * offers real next routes without disguising absence as content.
 */
import {
	createButton,
	createElement,
	createLink
} from './card/domFactory.js';

export function statusCard(title, message, tone = '') {
	const card = createElement(
		'article',
		`home-post-card geelooy-feed-card cosmic-status-card ${tone}`.trim()
	);
	card.append(
		createElement('span', 'post-source-icon', {
			'aria-hidden': 'true'
		}, '✦'),
		createElement('h2', 'post-title', {}, title),
		createElement('p', 'post-body', {}, message)
	);
	return card;
}

export function emptyCard(mode, onOpenSearch) {
	const card = createElement(
		'article',
		'home-post-card geelooy-feed-card cosmic-empty-card'
	);
	const actions = createElement('div', 'home-empty-actions');
	const search = createButton('Search archive', 'home-empty-search');

	search.addEventListener('click', event => {
		event.stopPropagation();
		onOpenSearch?.();
	});
	actions.append(
		createLink('Enter Ikar Heichel', '/heichelos/ikar', 'home-empty-ikar'),
		search,
		createLink('Create a post', '/heichelos/submit', 'home-empty-create')
	);
	card.append(
		createElement('span', 'post-source-icon', {
			'aria-hidden': 'true'
		}, '🌊'),
		createElement('h2', 'post-title', {}, 'No posts in this stream yet'),
		createElement(
			'p',
			'post-body',
			{},
			`The ${mode} river is quiet. Enter Ikar, search, or publish something real.`
		),
		actions
	);
	return card;
}

export function metricCard(label, value) {
	const card = createElement('article', 'civilization-metric-card');
	card.append(
		createElement('strong', '', {}, compact(value)),
		createElement('small', '', {}, label)
	);
	return card;
}

export function feedTypePill(type) {
	return createElement('span', 'object-pill', {}, type || 'object');
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
