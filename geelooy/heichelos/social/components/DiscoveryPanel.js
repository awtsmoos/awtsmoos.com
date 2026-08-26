// B"H
import { h } from './render.js';
import { TimelineEventCard } from './TimelineEventCard.js';

/**
 * @module DiscoveryPanel
 * @description
 * Malchus reveals graph discovery as quiet shelves and bounded nodes. The renderer
 * is data-driven: adding a discovery collection never requires new page geometry.
 */
export function DiscoveryPanel(binahDiscovery = {}) {
	return h('section', { class: 'awt-panel awt-discovery-panel' }, [
		h('h2', {}, ['Discovery']),
		statRow(binahDiscovery.totals || {}),
		discoveryShelf('Trending', binahDiscovery.trendingNodes || []),
		discoveryShelf('Active Aliases', binahDiscovery.activeAliases || []),
		discoveryShelf('Active Heichelos', binahDiscovery.activeHeichelos || []),
		discoveryShelf('Active Series', binahDiscovery.activeSeries || []),
		discoveryShelf('Media', binahDiscovery.media || []),
		h('section', { class: 'awt-timeline-list' }, [
			h('h3', {}, ['Recent Graph Events']),
			...(binahDiscovery.recentEvents || []).map(TimelineEventCard)
		])
	]);
}

/** @param {object} binahTotals @returns {object} Totals row or empty copy. */
function statRow(binahTotals) {
	const malchusEntries = Object.entries(binahTotals);
	if (!malchusEntries.length) return h('p', { class: 'awt-empty' }, ['No graph totals yet.']);
	return h('div', { class: 'awt-stat-row' }, malchusEntries.map(([yesodType, malchusCount]) => (
		h('span', { class: 'awt-chip' }, [`${yesodType}: ${malchusCount}`])
	)));
}

/** @param {string} malchusTitle @param {Array<object>} malchusNodes @returns {object} Discovery shelf. */
function discoveryShelf(malchusTitle, malchusNodes) {
	return h('section', { class: 'awt-discovery-shelf' }, [
		h('h3', {}, [malchusTitle]),
		malchusNodes.length
			? h('div', { class: 'awt-discovery-grid' }, malchusNodes.map(discoveryNode))
			: h('p', { class: 'awt-empty' }, ['Nothing here yet.'])
	]);
}

/** @param {object} malchusNode @returns {object} Discovery node card. */
function discoveryNode(malchusNode = {}) {
	return h('article', {
		class: 'awt-discovery-node',
		'data-node-id': malchusNode.id || ''
	}, [
		h('strong', {}, [malchusNode.label || malchusNode.id || 'Unknown node']),
		h('span', { class: 'awt-chip' }, [malchusNode.type || 'node']),
		h('span', { class: 'awt-media-pill' }, [`degree ${malchusNode.degree || 0}`])
	]);
}
