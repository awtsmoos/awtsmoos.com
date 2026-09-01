//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file layout.test.mjs
 * The Awtsmoos renews a workspace around the canvas while Awtsmoos.com guards against falling back into a settings-page maze;
 * this witness proves tools, objects, viewport, inspector, timeline, mobile doors, and advanced vessels all share one editor phase.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { UI } from '../../../libs/AwtsmoosUI/src/index.js';
import { createStudioLayout } from '../src/StudioLayout.js';

/**
 * Walk one declarative UI tree and collect nodes satisfying a predicate.
 * The traversal is Hod: it communicates structural evidence without mounting a browser.
 *
 * @param {object} node Declarative AwtsmoosUI node to inspect.
 * @param {(candidate: object) => boolean} predicate Structural condition that identifies evidence.
 * @param {object[]} matches Accumulated matching nodes.
 * @returns {object[]} Every matching node in depth-first order.
 */
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
});

test('Studio constructs one canvas-first editor shell', () => {
	const layout = createStudioLayout();
	assert.equal(layout.class, 'studio-editor-shell');
	for (const className of [
		'studio-tool-rail',
		'studio-editor-sidebar',
		'studio-editor-viewport',
		'studio-editor-inspector',
		'studio-timeline-dock',
		'studio-mobile-dock'
	]) {
		assert.equal(collectNodes(layout, node => node.class === className).length, 1, className);
	}
	assert.equal(collectNodes(layout, node => node['data-studio-canvas'] === 'true').length, 1);
	assert.equal(collectNodes(layout, node => node.class === 'studio-template-shelf').length, 0);
});

test('raw JSON exists only inside the advanced panel tree', () => {
	const layout = createStudioLayout();
	const jsonEditors = collectNodes(layout, node => node.class === 'studio-json-editor');
	assert.equal(jsonEditors.length, 1);
	const advancedPanels = collectNodes(layout, node => node['data-panel'] === 'advanced');
	assert.equal(advancedPanels.length, 1);
	assert.equal(collectNodes(advancedPanels[0], node => node.class === 'studio-json-editor').length, 1);
});
