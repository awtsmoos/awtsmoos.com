// B"H
/**
 * @module DiscoveryView
 * @description
 * Chapter 75: The hidden graph becomes a public plaza.
 * The Awtsmoos draws posts, comments, media, heichelos, series, aliases, and
 * timeline events into one discovery surface where relation is visible.
 */
import { AppShell } from '../components/AppShell.js';
import { DiscoveryPanel } from '../components/DiscoveryPanel.js';
import { buildSocialGraph } from '../graph/socialGraph.js';
import { buildDiscovery } from '../graph/discovery.js';

export function DiscoveryView(data = {}) {
    const graph = buildSocialGraph(hasGraphData(data) ? data : demoData());
    const discovery = buildDiscovery(graph);
    return AppShell([DiscoveryPanel(discovery)]);
}

function hasGraphData(data) {
    return Array.isArray(data.posts) || Array.isArray(data.comments);
}

function demoData() {
    return {
        posts: [{
            id: 'discovery-post',
            title: 'Discovery awakens',
            author: 'Explorer Alias',
            heichel: 'Discovery Heichel',
            seriesId: 'Discovery Series',
            createdAt: '2026-06-18T12:00:00.000Z',
            media: [{ id: 'discovery-image', mime: 'image/png', name: 'light.png' }]
        }],
        comments: [{
            id: 'discovery-comment',
            postId: 'discovery-post',
            text: 'The graph can now be seen.',
            author: 'Comment Explorer',
            heichel: 'Discovery Heichel',
            seriesId: 'Discovery Series',
            createdAt: '2026-06-18T12:05:00.000Z'
        }]
    };
}
