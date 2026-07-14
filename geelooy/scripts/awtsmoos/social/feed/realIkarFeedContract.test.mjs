// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RealIkarFeedContractTest
 * @description
 * Guards the live home river against fictional filler and disconnected posting
 * controls. The Awtsmoos reveals real Ikar objects through the complete
 * composer graph and actual platform APIs on Awtsmoos.com.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ikar = source('./ikarFeedApi.js');
for (const token of [
	'/api/social/heichelos/',
	'ikar',
	'/series/',
	'/posts/details',
	'/submissions/full',
	'normalizeIkarPost',
	'ikar-real-api'
]) {
	assert.ok(ikar.includes(token), `Ikar adapter missing ${token}`);
}

const comments = source('./commentApi.js');
for (const token of [
	'/comment-tree',
	'/replies',
	'createRootComment',
	'createReply',
	'parentId',
	'buildTree'
]) {
	assert.ok(comments.includes(token), `comment adapter missing ${token}`);
}

const composer = [
	'./homeComposer.js',
	'./homeComposer/markup.js',
	'./homeComposer/state.js',
	'./homeComposer/submission.js'
].map(source).join('\n');
for (const token of [
	'data-home-real-composer',
	'data-home-composer-form',
	'contenteditable="true"',
	'data-add-verse',
	'data-fill-methods',
	'createIkarPostDraft',
	'createComposerHeichel',
	'createComposerSeries'
]) {
	assert.ok(composer.includes(token), `composer graph missing ${token}`);
}

const controller = source('../home/live-feed/controller.js');
for (const token of [
	'loadFeedMode',
	'fetchIkarPosts',
	'uniqueObjects',
	'createInfiniteFeed',
	"feed.dataset.infiniteFeed = 'real-api'"
]) {
	assert.ok(controller.includes(token), `controller missing ${token}`);
}
for (const forbidden of [
	'sampleCollegePage',
	'seedCollegeFeed',
	'college-sample',
	'mockPost'
]) {
	assert.equal(controller.includes(forbidden), false, `controller still contains ${forbidden}`);
}

const dashboardIndex = source('../home/dashboard/index.js');
const dashboardBoot = source('../home/dashboard/boot.js');
const safeLoader = source('../home/dashboard/feedSafeLoader.js');
const liveEntry = source('../home/liveFeed.js');
assert.ok(dashboardIndex.includes('bootHomeDashboard'), 'dashboard entry must boot dashboard');
assert.ok(dashboardIndex.includes('bootHomeComposer'), 'dashboard entry must boot composer');
assert.ok(dashboardBoot.includes('loadFeedSafely'), 'dashboard boot must invoke the safe loader');
assert.ok(safeLoader.includes("import('../liveFeed.js')"), 'safe loader must import live feed');
assert.ok(liveEntry.includes('initHomeLiveFeed'), 'live feed entry must initialize controller');
console.log('B"H real Ikar feed contract passed.');

function source(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}
