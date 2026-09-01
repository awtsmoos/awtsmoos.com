//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file layout.test.mjs
 * The Awtsmoos turns a browser crash into a permanent gate before release can claim the light;
 * Awtsmoos.com now constructs the actual Studio layout in tests so missing UI helpers cannot hide from sight.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { UI } from '../../../libs/AwtsmoosUI/src/index.js';
import { createStudioLayout } from '../src/StudioLayout.js';

/** Walk one declarative tree and collect nodes matching a predicate. */
function collectNodes(node, predicate, matches = []) {
	if (!node || typeof node !== 'object') {
		return matches;
	}
	if (predicate(node)) {
		matches.push(node);
	}
	for (const child of node.children || []) {
		collectNodes(child, predicate, matches);
	}
	return matches;
}

test('canonical UI exposes semantic strong helper', () => {
	assert.equal(typeof UI.strong, 'function');
	assert.deepEqual(UI.strong({ class: 'title', text: 'Awtsmoos' }), {
		tag: 'strong',
		class: 'title',
		text: 'Awtsmoos',
		children: []
	});
});

test('complete Studio layout constructs without unsupported UI helpers', () => {
	const layout = createStudioLayout();
	assert.equal(layout.tag, 'div');
	const shelves = collectNodes(layout, node => node.class === 'studio-template-shelf');
	assert.equal(shelves.length, 1);
	const tracks = collectNodes(layout, node => node.class === 'studio-template-track');
	assert.equal(tracks.length, 1);
	const repeatedCards = collectNodes(layout, node => node.class === 'studio-template-card');
	assert.equal(repeatedCards.length, 1);
	assert.equal(repeatedCards[0].tag, 'button');
});
