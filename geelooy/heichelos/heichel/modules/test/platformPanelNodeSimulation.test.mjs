//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PlatformPanelNodeSimulation
 * @description The Awtsmoos lets Advanced remain dormant until invited while every common operational road still carries real data;
 * Awtsmoos.com proves mount idempotence, lazy diagnostics, search, feed, presence, sync, and error states through the new clean shell.
 */
import assert from 'node:assert/strict';
import {
	action,
	clickAction,
	mountWithFetch,
	openPlatform,
	statusOf,
	textOf,
	wait
} from './helpers/platformPanelHarness.mjs';
import { mountPlatformPanel } from '../ui/platformPanel.js';

async function testMountAndLazyDb() {
	const { calls, document, panel } = await mountWithFetch();
	assert.ok(panel);
	assert.equal(panel.open, false);
	assert.equal(mountPlatformPanel({ root: document.body }), null);
	const names = panel.querySelectorAll('[data-platform-action]').map(button => button.dataset.platformAction);
	assert.equal(names.length, 14);
	assert.equal(new Set(names).size, 14);
	assert.equal(calls.some(call => call.url.endsWith('/api/social/packed/stats')), false);
	await openPlatform(panel);
	assert.match(textOf(panel), /core: 7 records \/ 5 keys/);
	assert.match(textOf(panel), /manifests: 2/);
	const count = calls.filter(call => call.url.endsWith('/api/social/packed/stats')).length;
	await panel.emit('toggle');
	assert.equal(calls.filter(call => call.url.endsWith('/api/social/packed/stats')).length, count);
}

async function testSearch() {
	const { panel } = await mountWithFetch();
	const form = panel.querySelector('.awtsmoos-platform-search');
	form.querySelector('[name="q"]').value = 'spark';
	await form.emit('submit');
	await wait();
	assert.match(textOf(panel), /Search \(1\)/);
	assert.match(textOf(panel), /Search Spark/);
}

async function testCommonActions() {
	const { calls, panel } = await mountWithFetch();
	await clickAction(panel, 'feed');
	assert.match(textOf(panel), /Feed Post/);
	await clickAction(panel, 'presence');
	assert.match(textOf(panel), /Alias is online/);
	await clickAction(panel, 'sync');
	assert.match(textOf(panel), /Pulled shard delta/);
	assert.ok(calls.some(call => call.url.includes('packed/feed/materialize') && call.opts.method === 'POST'));
	assert.ok(calls.some(call => call.url.includes('live/presence') && call.opts.method === 'POST'));
}

async function testFailure() {
	const { panel } = await mountWithFetch({ failPattern: 'packed/stats' });
	await clickAction(panel, 'db');
	assert.match(statusOf(panel), /failed|unavailable/i);
	assert.match(textOf(panel), /failed|Unable to/i);
}

await testMountAndLazyDb();
await testSearch();
await testCommonActions();
await testFailure();
assert.ok(action);
console.log('B"H platformPanelNodeSimulation.test passed');
