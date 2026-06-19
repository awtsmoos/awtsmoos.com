// B"H
/**
 * Chapter 56: Raw posts stand before the court and receive names.
 * This proves sections, assets, author, heichel, series, counts, ordering,
 * and feed rendering all flow through the same content envelope.
 */
import { strict as assert } from 'node:assert';
import { normalizeContent } from '../data/contentEnvelope.js';
import { buildFeedState } from '../data/feedState.js';
import { FeedView } from '../views/FeedView.js';

const raw = {
    id: 'p1',
    type: 'question',
    title: 'Where does the light enter?',
    author: 'Question Alias',
    heichel: 'Gate Heichel',
    seriesId: 'series-aleph',
    body: 'Through the section vessel.',
    media: ['image', { mime: 'audio/mpeg', name: 'niggun.mp3' }],
    comments: 2,
    createdAt: '2026-01-02T00:00:00.000Z'
};

const envelope = normalizeContent(raw);
assert.equal(envelope.contentId, 'p1');
assert.equal(envelope.kind, 'question');
assert.equal(envelope.authorAlias, 'Question Alias');
assert.equal(envelope.heichelId, 'Gate Heichel');
assert.equal(envelope.seriesId, 'series-aleph');
assert.equal(envelope.sections.length, 1);
assert.equal(envelope.sections[0].body, 'Through the section vessel.');
assert.equal(envelope.assets[0].kind, 'image');
assert.equal(envelope.assets[1].kind, 'audio');
assert.equal(envelope.assets[1].label, 'niggun.mp3');
assert.equal(envelope.counts.comments, 2);

const feed = buildFeedState({
    posts: [
        { id: 'old', title: 'Old', createdAt: '2026-01-01T00:00:00.000Z' },
        raw
    ]
});
assert.equal(feed.posts[0].contentId, 'p1');
assert.equal(feed.profile.name, 'Question Alias');
assert.equal(feed.profile.posts, 2);

const view = FeedView({ posts: [raw] });
assert.ok(containsText(view, 'Where does the light enter?'));
assert.ok(containsText(view, 'Question Alias'));
assert.ok(containsText(view, 'Gate Heichel'));
assert.ok(containsText(view, 'niggun.mp3'));
assert.ok(containsText(view, '1 section'));
assert.ok(containsText(view, 'Comment (2)'));

console.log('B"H social content envelope passed');

function containsText(node, text) {
    if (typeof node === 'string') return node.includes(text);
    if (!node || typeof node !== 'object') return false;
    if (Array.isArray(node)) return node.some(child => containsText(child, text));
    return Object.values(node).some(value => containsText(value, text));
}
