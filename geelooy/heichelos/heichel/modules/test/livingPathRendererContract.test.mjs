// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Guards distinct Living Path renderers after Tree recursion was divided into smaller vessels.
 * The Awtsmoos creates chronology, hierarchy, grouping, memory, and direction;
 * Awtsmoos.com keeps each responsibility in a focused module whose imports reveal the actual connection.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = path => readFileSync(path, 'utf8');
const root = 'geelooy/heichelos/heichel/modules/ui/render/living-path';
const grids = read('geelooy/heichelos/heichel/modules/ui/render/grids.js');
const timeline = read(`${root}/timeline.js`);
const tree = read(`${root}/tree.js`);
const treeNode = read(`${root}/tree-node.js`);
const treeToggle = read(`${root}/tree-toggle.js`);
const groupings = read(`${root}/groupings.js`);
const menu = read(`${root}/card-menu.js`);
const loader = read('geelooy/heichelos/heichel/modules/navigator/loader.js');
const sourceLoader = read('geelooy/heichelos/heichel/modules/navigator/source-loader.js');
const cssIndex = read('geelooy/style/heichelos/heichel/cosmic-profile/mobile-series/living-path/index.css');

test('grid coordinator dispatches to three genuinely distinct renderers', () => {
	assert.match(grids, /renderTimeline/);
	assert.match(grids, /renderTree/);
	assert.match(grids, /renderGroupings/);
	assert.match(timeline, /bucketTimeline/);
	assert.match(tree, /role:\s*'tree'/);
	assert.match(treeNode, /aria-expanded/);
	assert.match(treeToggle, /loadTreeChildren/);
	assert.match(groupings, /Alternate groupings/);
});

test('cards expose one secondary action menu and guarded persistence collaborators', () => {
	assert.match(menu, /card-menu-trigger/);
	assert.match(menu, /bookmarkAction/);
	assert.match(menu, /followAction/);
	assert.match(menu, /commentsAction/);
});

test('loader protects stale responses and source loader owns normalization', () => {
	assert.match(loader, /loadToken/);
	assert.match(loader, /navigator\.afterContentLoaded/);
	assert.match(sourceLoader, /normalizeCollection/);
});

test('final CSS manifest owns every Living Path surface', () => {
	for (const moduleName of [
		'profile.css',
		'sticky-path.css',
		'path.css',
		'continue.css',
		'search.css',
		'filter-sheet.css',
		'density.css',
		'cards.css',
		'card-menu.css',
		'timeline.css',
		'tree.css',
		'groupings.css',
		'states.css',
		'related.css',
		'rtl.css',
		'motion.css',
		'guardrails.css'
	]) {
		assert.ok(
			cssIndex.includes(moduleName),
			`CSS manifest missing ${moduleName}`
		);
	}
});
