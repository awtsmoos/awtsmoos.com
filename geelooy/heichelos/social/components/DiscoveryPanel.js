// B"H
/**
 * @module DiscoveryPanel
 * @description
 * Chapter 74: Discovery becomes a dashboard of living relation.
 * Trending nodes, active aliases, heichelos, series, media, and recent events
 * gather into one surface so the network feels alive instead of merely listed.
 */
import { h } from './render.js';
import { TimelineEventCard } from './TimelineEventCard.js';

export function DiscoveryPanel(discovery = {}) {
    return h('section', { class: 'awt-panel awt-discovery-panel' }, [
        h('h2', {}, ['Discovery']),
        stats(discovery.totals || {}),
        shelf('Trending', discovery.trendingNodes || []),
        shelf('Active Aliases', discovery.activeAliases || []),
        shelf('Active Heichelos', discovery.activeHeichelos || []),
        shelf('Active Series', discovery.activeSeries || []),
        shelf('Media', discovery.media || []),
        h('section', { class: 'awt-timeline-list' }, [
            h('h3', {}, ['Recent Graph Events']),
            ...((discovery.recentEvents || []).map(TimelineEventCard))
        ])
    ]);
}

function stats(totals) {
    const entries = Object.entries(totals);
    if (!entries.length) return h('p', { class: 'awt-empty' }, ['No graph totals yet.']);
    return h('div', { class: 'awt-stat-row' }, entries.map(([type, count]) => h('span', { class: 'awt-chip' }, [`${type}: ${count}`])));
}

function shelf(title, nodes) {
    return h('section', { class: 'awt-discovery-shelf' }, [
        h('h3', {}, [title]),
        nodes.length ? h('div', { class: 'awt-discovery-grid' }, nodes.map(nodeCard)) : h('p', { class: 'awt-empty' }, ['Nothing here yet.'])
    ]);
}

function nodeCard(node) {
    return h('article', { class: 'awt-discovery-node', 'data-node-id': node.id || '' }, [
        h('strong', {}, [node.label || node.id || 'Unknown node']),
        h('span', { class: 'awt-chip' }, [node.type || 'node']),
        h('span', { class: 'awt-media-pill' }, [`degree ${node.degree || 0}`])
    ]);
}
