// B"H
/**
 * Chapter 78: Discovery is tested as a visible plaza, not hidden machinery.
 * The graph must become totals, shelves, media, active vessels, and recent
 * events that a real user can see through the revamp shell.
 */
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { DiscoveryView } from '../views/DiscoveryView.js';
import { buildSocialGraph } from '../graph/socialGraph.js';
import { buildDiscovery } from '../graph/discovery.js';

const styleIndex = readFileSync('geelooy/heichelos/social/styles/index.css', 'utf8');
assert.ok(styleIndex.includes('discovery.css'), 'social style index imports discovery styles');

const data = {
    posts: [{
        id: 'discovery-post-1',
        title: 'Discovery Post',
        author: 'Discovery Alias',
        heichel: 'Discovery Heichel',
        seriesId: 'Discovery Series',
        createdAt: '2026-06-18T13:00:00.000Z',
        media: [{ id: 'discovery-image-1', mime: 'image/png', name: 'cover.png' }]
    }],
    comments: [{
        id: 'discovery-comment-1',
        postId: 'discovery-post-1',
        text: 'Discovery comment',
        author: 'Comment Alias',
        heichel: 'Discovery Heichel',
        seriesId: 'Discovery Series',
        createdAt: '2026-06-18T13:05:00.000Z'
    }]
};

const graph = buildSocialGraph(data);
const discovery = buildDiscovery(graph);
assert.equal(discovery.totals.alias, 2);
assert.equal(discovery.totals.post, 1);
assert.equal(discovery.totals.comment, 1);
assert.equal(discovery.totals.media, 1);
assert.ok(discovery.activeAliases.some(node => node.label === 'Discovery Alias'));
assert.ok(discovery.activeHeichelos.some(node => node.label === 'Discovery Heichel'));
assert.ok(discovery.activeSeries.some(node => node.label === 'Discovery Series'));
assert.ok(discovery.media.some(node => node.label === 'cover.png'));

const view = DiscoveryView(data);
assert.ok(containsText(view, 'Discovery'));
assert.ok(containsText(view, 'Trending'));
assert.ok(containsText(view, 'Active Aliases'));
assert.ok(containsText(view, 'Active Heichelos'));
assert.ok(containsText(view, 'Active Series'));
assert.ok(containsText(view, 'Media'));
assert.ok(containsText(view, 'Recent Graph Events'));
assert.ok(containsText(view, 'Discovery Alias'));
assert.ok(containsText(view, 'Discovery Post'));
assert.ok(containsText(view, 'Discovery Heichel'));
assert.ok(containsText(view, 'Discovery Series'));
assert.ok(containsText(view, 'cover.png'));
assert.ok(containsText(view, 'Discovery Alias created Discovery Post'));

console.log('B"H social discovery view passed');

function containsText(node, text) {
    if (typeof node === 'string') return node.includes(text);
    if (!node || typeof node !== 'object') return false;
    if (Array.isArray(node)) return node.some(child => containsText(child, text));
    return Object.values(node).some(value => containsText(value, text));
}
