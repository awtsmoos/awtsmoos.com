// B"H
/**
 * Chapter 71: The graph is tested as the hidden city beneath every page.
 * Alias, post, comment, heichel, series, and media must all become nodes;
 * their relations must become edges, timelines, and discovery summaries.
 */
import { strict as assert } from 'node:assert';
import { buildSocialGraph } from '../graph/socialGraph.js';
import { buildTimeline, filterTimeline } from '../graph/timeline.js';
import { buildDiscovery } from '../graph/discovery.js';

const data = {
    posts: [{
        id: 'post-1',
        title: 'Graph Post',
        author: 'Graph Alias',
        heichel: 'Graph Heichel',
        seriesId: 'Graph Series',
        createdAt: '2026-06-18T12:00:00.000Z',
        media: [
            { id: 'image-1', mime: 'image/png', name: 'cover.png' },
            { id: 'audio-1', mime: 'audio/mpeg', name: 'song.mp3' }
        ]
    }],
    comments: [{
        id: 'comment-1',
        postId: 'post-1',
        text: 'Graph comment',
        author: 'Comment Alias',
        heichel: 'Graph Heichel',
        seriesId: 'Graph Series',
        createdAt: '2026-06-18T12:05:00.000Z'
    }, {
        id: 'comment-2',
        postId: 'post-1',
        replyTo: 'comment-1',
        text: 'Graph reply',
        author: 'Reply Alias',
        heichel: 'Graph Heichel',
        seriesId: 'Graph Series',
        createdAt: '2026-06-18T12:06:00.000Z'
    }]
};

const graph = buildSocialGraph(data);
assertNode(graph, 'alias:Graph Alias', 'alias');
assertNode(graph, 'alias:Comment Alias', 'alias');
assertNode(graph, 'post:post-1', 'post');
assertNode(graph, 'comment:comment-1', 'comment');
assertNode(graph, 'comment:comment-2', 'comment');
assertNode(graph, 'heichel:Graph Heichel', 'heichel');
assertNode(graph, 'series:Graph Series', 'series');
assertNode(graph, 'media:image-1', 'media');
assertNode(graph, 'media:audio-1', 'media');

assertEdge(graph, 'alias:Graph Alias', 'post:post-1', 'created');
assertEdge(graph, 'alias:Comment Alias', 'comment:comment-1', 'commented');
assertEdge(graph, 'comment:comment-1', 'post:post-1', 'on-post');
assertEdge(graph, 'comment:comment-2', 'comment:comment-1', 'replied-to');
assertEdge(graph, 'post:post-1', 'heichel:Graph Heichel', 'in-heichel');
assertEdge(graph, 'post:post-1', 'series:Graph Series', 'in-series');
assertEdge(graph, 'post:post-1', 'media:image-1', 'has-media');

const timeline = buildTimeline(graph);
assert.ok(timeline.some(event => event.summary.includes('Graph Alias created Graph Post')));
assert.ok(timeline.some(event => event.type === 'commented'));
assert.equal(filterTimeline(timeline, { type: 'created' }).length, 1);
assert.equal(filterTimeline(timeline, { objectType: 'media' }).length, 2);

const discovery = buildDiscovery(graph);
assert.equal(discovery.totals.alias, 3);
assert.equal(discovery.totals.post, 1);
assert.equal(discovery.totals.comment, 2);
assert.equal(discovery.totals.media, 2);
assert.ok(discovery.activeAliases.some(node => node.id === 'alias:Graph Alias'));
assert.ok(discovery.activeHeichelos.some(node => node.id === 'heichel:Graph Heichel'));
assert.ok(discovery.activeSeries.some(node => node.id === 'series:Graph Series'));
assert.ok(discovery.media.some(node => node.label === 'cover.png'));
assert.ok(discovery.recentEvents.length > 0);

console.log('B"H social graph layer passed');

function assertNode(graph, id, type) {
    const node = graph.nodes.find(entry => entry.id === id);
    assert.ok(node, 'missing node ' + id);
    assert.equal(node.type, type);
}

function assertEdge(graph, from, to, type) {
    const edge = graph.edges.find(entry => entry.from === from && entry.to === to && entry.type === type);
    assert.ok(edge, `missing edge ${from} -${type}-> ${to}`);
}
