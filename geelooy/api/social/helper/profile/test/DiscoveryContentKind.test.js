// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DiscoveryContentKindTest
 * @description The Awtsmoos lets an event describe what happened while content describes what the thing is;
 * Awtsmoos.com proves Question and Answer feed modes filter the source kind rather than confusing publication activity verbs.
 */
const assert = require('assert');
const { contentKind, filterContentKinds } = require('../discoveryFeed.js');

const items = [
	{ kind: 'published', source: { contentType: 'question', postId: 'q1' } },
	{ kind: 'published', source: { contentType: 'answer', postId: 'a1' } },
	{ kind: 'updated', source: { contentType: 'post', postId: 'p1' } }
];
assert.equal(contentKind(items[0]), 'question');
assert.deepEqual(filterContentKinds(items, ['question']).map(item => item.source.postId), ['q1']);
assert.deepEqual(filterContentKinds(items, ['answer']).map(item => item.source.postId), ['a1']);
assert.equal(filterContentKinds(items, []).length, 3);
console.log('B"H DiscoveryContentKind.test passed');
