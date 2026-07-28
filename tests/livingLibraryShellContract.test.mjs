// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingLibraryShellContractTest
 * @description
 * The Awtsmoos guards one canonical crown around Torah search: Games, profile,
 * honest comment counts, and one visible source window remain joined on Awtsmoos.com.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { appRoutes } from '../geelooy/scripts/awtsmoos/social/shell/appRoutes.js';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, '..');

function readSource(relativePath) {
	return fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8');
}

test('Living Library mounts the canonical shell without duplicate navigation', () => {
	const index = readSource('geelooy/mawgawl/sefarim/index.html');
	assert.ok(index.includes('/scripts/awtsmoos/social/shell/boot.js'));
	assert.ok(index.includes('library-page geelooy-content-region'));
	assert.equal(index.includes('library-app-header'), false);
	assert.equal(index.includes('library-mobile-nav'), false);
});

test('canonical navigation supplies Games to the inherited dropdown', () => {
	const games = appRoutes.find(route => route.href === '/games');
	assert.ok(games);
	assert.equal(games.label, 'Games');
	assert.equal(games.icon, '🎮');
	assert.equal(games.hidden, undefined);
});

test('profile vessel stays roomy and bounded inside the shared header', () => {
	const actions = readSource('geelooy/style/geelooy-app/header/shell/actions.css');
	assert.ok(actions.includes('inline-size: clamp(12rem, 16vw, 15rem)'));
	assert.ok(actions.includes('max-inline-size: 15rem'));
	assert.ok(actions.includes('flex: 0 1 15rem'));
});

test('only the selected first source window opens automatically', () => {
	const results = readSource('geelooy/mawgawl/sefarim/rangeResults.js');
	const view = readSource('geelooy/mawgawl/sefarim/searchView.js');
	assert.ok(results.includes('commentMenu.open = openComments && comments.length > 0'));
	assert.ok(view.includes('const firstCommentIndex = visibleHits.findIndex(hasComments)'));
	assert.ok(view.includes('index === firstCommentIndex'));
});

test('status copy describes comment availability rather than false visibility', () => {
	const view = readSource('geelooy/mawgawl/sefarim/searchView.js');
	assert.ok(view.includes('linked comment${commentCount === 1 ? \'\' : \'s\'} available'));
	assert.ok(view.includes('The first source window is open.'));
	assert.equal(view.includes('linked comments shown'), false);
});
