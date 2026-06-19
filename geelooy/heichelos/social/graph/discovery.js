// B"H
/**
 * @module SocialDiscovery
 * @description
 * Chapter 70: Discovery is not a separate kingdom.
 * The Awtsmoos reads degree, media, heichel, series, and event density from
 * the same graph so trending, suggested creators, and active places emerge
 * from relation instead of invented side channels.
 */
import { buildSocialGraph } from './socialGraph.js';
import { buildTimeline } from './timeline.js';

export function buildDiscovery(data = {}) {
    const graph = data.nodes && data.edges ? data : buildSocialGraph(data);
    const timeline = buildTimeline(graph);
    return {
        trendingNodes: topByDegree(graph.nodes, 8),
        activeAliases: topByType(graph.nodes, 'alias', 6),
        activeHeichelos: topByType(graph.nodes, 'heichel', 6),
        activeSeries: topByType(graph.nodes, 'series', 6),
        media: topByType(graph.nodes, 'media', 6),
        recentEvents: timeline.slice(0, 10),
        totals: countTypes(graph.nodes)
    };
}

function topByType(nodes, type, limit) {
    return topByDegree(nodes.filter(node => node.type === type), limit);
}

function topByDegree(nodes, limit) {
    return [...nodes]
        .sort((a, b) => b.degree - a.degree || a.id.localeCompare(b.id))
        .slice(0, limit)
        .map(node => ({ id: node.id, type: node.type, label: labelFor(node), degree: node.degree }));
}

function countTypes(nodes) {
    return nodes.reduce((counts, node) => {
        counts[node.type] = (counts[node.type] || 0) + 1;
        return counts;
    }, {});
}

function labelFor(node) {
    return node.data?.title || node.data?.name || node.data?.label || node.data?.text || node.id;
}
