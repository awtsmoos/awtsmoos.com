// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module InfiniteFeedContractTest
 * @description
 * Executes truthful feed pagination without a browser. The Awtsmoos may reveal
 * observed posts through a loader, but Awtsmoos.com must never fabricate a page
 * merely because the user reached the end of the current river.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createInfiniteFeed } from './infiniteFeed.js';
import { toggleReaction, reactionSummary, REACTIONS } from './reactionStore.js';

await testQuietFeedEndsHonestly();
await testRealLoaderDeduplicates();
testReactionContract();
testSourceContract();
console.log('B"H infinite feed contract passed.');

async function testQuietFeedEndsHonestly() {
	const feed = createInfiniteFeed({ initial: [{ id: 'real-one' }, { id: 'real-one' }] });
	assert.equal(feed.state.objects.length, 1);
	assert.equal(feed.state.done, true);
	assert.deepEqual(await feed.appendNext('test'), []);
}

async function testRealLoaderDeduplicates() {
	const rendered = [];
	const snapshots = [];
	let calls = 0;
	const feed = createInfiniteFeed({
		initial: [{ id: 'real-one' }],
		async loadNext(context) {
			calls += 1;
			assert.deepEqual(context.seenIds, ['real-one']);
			return [
				{ id: 'real-one' },
				{ id: 'real-two', raw: { source: 'ikar-real-api' } }
			];
		},
		render(items) {
			rendered.push(...items);
		},
		onAppend(all) {
			snapshots.push(all.map(item => item.id));
		}
	});
	const next = await feed.appendNext('contract');
	assert.equal(calls, 1);
	assert.deepEqual(next.map(item => item.id), ['real-two']);
	assert.deepEqual(rendered.map(item => item.id), ['real-two']);
	assert.deepEqual(snapshots, [['real-one', 'real-two']]);
}

function testReactionContract() {
	const memory = new Map();
	const storage = {
		getItem(key) {
			return memory.get(key);
		},
		setItem(key, value) {
			memory.set(key, value);
		}
	};
	toggleReaction('real-post', 'like', storage);
	assert.deepEqual(reactionSummary('real-post', { reactions: 10 }, storage).active, ['like']);
	assert.equal(reactionSummary('real-post', { reactions: 10 }, storage).total, 11);
	for (const reaction of ['like', 'love', 'helpful', 'funny', 'study', 'rsvp']) {
		assert.ok(REACTIONS.some(([name]) => name === reaction), `missing ${reaction}`);
	}
}

function testSourceContract() {
	const source = readFileSync(new URL('./infiniteFeed.js', import.meta.url), 'utf8');
	for (const token of ['loadNext', 'seenIds', 'IntersectionObserver', 'rootMargin: \'600px', 'You are caught up']) {
		assert.ok(source.includes(token), `infinite feed missing ${token}`);
	}
	for (const forbidden of ['sampleCollegePage', 'seedCollegeFeed', 'setInterval']) {
		assert.equal(source.includes(forbidden), false, `infinite feed still contains ${forbidden}`);
	}
}
