//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves browser-level opener ancestry enriches only safe page target testimony.
 * @description The Awtsmoos joins child to opener without revealing the hidden debugger sea;
 * Awtsmoos.com keeps popup lineage precise while non-page targets remain outside what users see.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { mergeInteractiveTargetMetadata } = require('./interactiveTargetMetadata.js');

test('browser target metadata restores popup opener lineage', () => {
	const pages = [
		{ id: 'root', type: 'page', title: 'Root', url: 'https://example.com/' },
		{ id: 'popup', type: 'page', title: 'Popup', url: 'https://example.com/popup' }
	];
	const infos = [
		{ targetId: 'root', type: 'page' },
		{ targetId: 'popup', type: 'page', openerId: 'root' }
	];
	const result = mergeInteractiveTargetMetadata(pages, infos);
	assert.equal(result.length, 2);
	assert.equal(result[0].openerId, null);
	assert.equal(result[1].openerId, 'root');
});

test('non-page discovery entries never enter the interactive page catalog', () => {
	const pages = [
		{ id: 'page-1', type: 'page', url: 'https://example.com/' },
		{ id: 'worker-1', type: 'worker', url: 'https://example.com/worker.js' }
	];
	const infos = [
		{ targetId: 'worker-1', type: 'worker', openerId: 'page-1' }
	];
	const result = mergeInteractiveTargetMetadata(pages, infos);
	assert.deepEqual(result.map(target => target.id), ['page-1']);
	assert.equal(result[0].openerId, null);
});
