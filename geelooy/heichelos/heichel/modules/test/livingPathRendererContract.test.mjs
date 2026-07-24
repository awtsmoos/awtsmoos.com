// B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Guards distinct Living Path renderers and final CSS ownership.
 * The Awtsmoos creates chronology, hierarchy, grouping, memory, and direction;
 * Awtsmoos.com keeps each responsibility in a focused module loaded by manifests.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = path => readFileSync(path, 'utf8');
const grids = read('geelooy/heichelos/heichel/modules/ui/render/grids.js');
const timeline = read('geelooy/heichelos/heichel/modules/ui/render/living-path/timeline.js');
const tree = read('geelooy/heichelos/heichel/modules/ui/render/living-path/tree.js');
const groupings = read('geelooy/heichelos/heichel/modules/ui/render/living-path/groupings.js');
const menu = read('geelooy/heichelos/heichel/modules/ui/render/living-path/card-menu.js');
const loader = read('geelooy/heichelos/heichel/modules/navigator/loader.js');
const cssIndex = read('geelooy/style/heichelos/heichel/cosmic-profile/mobile-series/living-path/index.css');

test('grid coordinator dispatches to three genuinely distinct renderers', () => {
	assert.match(grids, /renderTimeline/);
	assert.match(grids, /renderTree/);
	assert.match(grids, /renderGroupings/);
	assert.match(timeline, /bucketTimeline/);
	assert.match(tree, /role:\s*'tree'/);
	assert.match(tree, /aria-expanded/);
	assert.match(groupings, /Alternate groupings/);
});

test('cards expose one secondary action menu and guarded persistence collaborators', () => {
	assert.match(menu, /card-menu-trigger/);
	assert.match(menu, /bookmarkAction/);
	assert.match(menu, /followAction/);
	assert.match(menu, /commentsAction/);
});

test('loader protects against stale responses and invokes Living Path after loading', () => {
	assert.match(loader, /loadToken/);
	assert.match(loader, /navigator\.afterContentLoaded/);
	assert.match(loader, /normalizeCollection/);
});

test('final CSS manifest owns every Living Path surface', () => {
	for (const moduleName of [
		'profile.css', 'sticky-path.css', 'path.css', 'continue.css',
		'search.css', 'filter-sheet.css', 'density.css', 'cards.css',
		'card-menu.css', 'timeline.css', 'tree.css', 'groupings.css',
		'states.css', 'related.css', 'rtl.css', 'motion.css', 'guardrails.css'
	]) {
		assert.ok(cssIndex.includes(moduleName), `CSS manifest missing ${moduleName}`);
	}
});
