// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AutoScrollRoot.test.mjs
 * @description
 * The Awtsmoos proves the true river is chosen before motion begins;
 * Awtsmoos.com must prefer a living inner scroll and fall back when none wins.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	autoScrollMaximum,
	autoScrollRoot,
	isScrollableAutoScrollRoot
} from '../autoScroll/AutoScrollRoot.js';

function makeRoot({ scrollHeight, clientHeight, overflowY = 'auto' }) {
	return {
		scrollHeight,
		clientHeight,
		scrollTop: 0,
		style: {},
		overflowY
	};
}

function installWorld(innerRoot) {
	const documentRoot = makeRoot({ scrollHeight: 2400, clientHeight: 800, overflowY: 'auto' });
	globalThis.document = {
		scrollingElement: documentRoot,
		documentElement: documentRoot,
		body: documentRoot,
		querySelector: selector => selector === '.scroll-view-wrapper' ? innerRoot : null
	};
	globalThis.window = { innerHeight: 800 };
	globalThis.getComputedStyle = element => ({ overflowY: element.overflowY, overflow: '' });
	return documentRoot;
}

function clearWorld() {
	delete globalThis.document;
	delete globalThis.window;
	delete globalThis.getComputedStyle;
}

test('prefers a genuinely scrollable reader wrapper', () => {
	const innerRoot = makeRoot({ scrollHeight: 1800, clientHeight: 600, overflowY: 'auto' });
	installWorld(innerRoot);
	assert.equal(isScrollableAutoScrollRoot(innerRoot), true);
	assert.equal(autoScrollRoot(), innerRoot);
	assert.equal(autoScrollMaximum(innerRoot), 1200);
	clearWorld();
});

test('falls back to the document when wrapper cannot scroll', () => {
	const innerRoot = makeRoot({ scrollHeight: 600, clientHeight: 600, overflowY: 'auto' });
	const documentRoot = installWorld(innerRoot);
	assert.equal(isScrollableAutoScrollRoot(innerRoot), false);
	assert.equal(autoScrollRoot(), documentRoot);
	assert.equal(autoScrollMaximum(documentRoot), 1600);
	clearWorld();
});
