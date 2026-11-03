// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PostsByAliasIndex.test.js
 * @description
 * The Awtsmoos proves that a tiny alias journal may locate posts without becoming truth itself;
 * Awtsmoos.com validates every locator canonically and never hydrates the global search map once the journal is active.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { postsByAliasIndex } = require('../../../packed/postsByAliasIndex.js');

function put(value, meta, key) {
	return { op: 'put', value, meta, key };
}

test('active journal bypasses global search enumeration and validates canonical truth', async () => {
	let journalLimit = 0;
	let listed = false;
	const locators = [
		{ v: 1, a: 'a', p: 'p1', h: 'h1', o: 'put', t: 3 },
		{ v: 1, a: 'a', p: 'p2', h: 'h1', o: 'put', t: 2 },
		{ v: 1, a: 'a', p: 'p3', h: 'h2', o: 'put', t: 1 }
	];
	const output = await postsByAliasIndex({
		$i: {}, aliasId: 'a', limit: 3,
		dependencies: {
			journalActive: () => true,
			readAliasJournalCandidates: async ({ limit }) => {
				journalLimit = limit;
				return locators;
			},
			listKeysReverseAsync: async () => { listed = true; throw new Error('must not list'); },
			findKeyReverseAsync: async ({ key }) => {
				if (key === '/allPosts/h1/p1') return put({ aliasId: 'a', heichelId: 'h1', postId: 'p1' });
				if (key === '/allPosts/h1/p2') return put({ aliasId: 'other', heichelId: 'h1', postId: 'p2' });
				return null;
			}
		}
	});
	assert.equal(journalLimit, 12);
	assert.equal(listed, false);
	assert.deepEqual(output.map(post => post.postId), ['p1']);
});

test('inactive journal preserves global materialized-index compatibility', async () => {
	let request = null;
	const key = '/indexes/postsByAlias/a/p1';
	const output = await postsByAliasIndex({
		$i: {}, aliasId: 'a', limit: 2,
		dependencies: {
			journalActive: () => false,
			listKeysReverseAsync: async value => { request = value; return [key]; },
			findKeyReverseAsync: async ({ shard, key: readKey }) => {
				if (shard === 'search') {
					return put(
						{ aliasId: 'a', heichelId: 'h1', postId: 'p1' },
						{ index: 'postsByAlias' },
						key
					);
				}
				if (readKey === '/allPosts/h1/p1') {
					return put({ aliasId: 'a', heichelId: 'h1', postId: 'p1', title: 'truth' });
				}
				return null;
			}
		}
	});
	assert.equal(request.shard, 'search');
	assert.equal(request.prefix, '/indexes/postsByAlias/a/');
	assert.equal(request.limit, 8);
	assert.equal(output[0].title, 'truth');
});

test('canonical read failure is isolated to its locator', async () => {
	const output = await postsByAliasIndex({
		$i: {}, aliasId: 'a', limit: 2,
		dependencies: {
			journalActive: () => true,
			readAliasJournalCandidates: async () => [
				{ v: 1, a: 'a', p: 'bad', h: 'h', o: 'put', t: 2 },
				{ v: 1, a: 'a', p: 'good', h: 'h', o: 'put', t: 1 }
			],
			findKeyReverseAsync: async ({ key: readKey }) => {
				if (readKey.endsWith('/bad')) throw new Error('simulated point-read failure');
				return put({ aliasId: 'a', heichelId: 'h', postId: 'good' });
			}
		}
	});
	assert.deepEqual(output.map(post => post.postId), ['good']);
});

test('empty alias returns before any storage dependency is called', async () => {
	let called = false;
	const output = await postsByAliasIndex({
		$i: {}, aliasId: '',
		dependencies: { journalActive: () => { called = true; return true; } }
	});
	assert.deepEqual(output, []);
	assert.equal(called, false);
});
