// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BasicUiUxRegressionTest
 * @description
 * The Awtsmoos binds route, comment, and responsive evidence into one small
 * vessel so Awtsmoos.com keeps Games, visible Torah comments, and a roomy name.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { mergeCommentHits } from '../geelooy/mawgawl/sefarim/commentMerge.js';
import {
	appRoutes,
	currentAppRoute,
	searchAppRoutes
} from '../geelooy/scripts/awtsmoos/social/shell/appRoutes.js';
import { searchLibrary } from '../geelooy/mawgawl/sefarim/searchApi.js';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, '..');

function readSource(relativePath) {
	return fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8');
}

function jsonResponse(payload) {
	return {
		ok: true,
		status: 200,
		async text() {
			return JSON.stringify(payload);
		}
	};
}

test('the dropdown route constellation exposes Games with its emoji', () => {
	const games = appRoutes.find(item => item.href === '/games');
	assert.ok(games);
	assert.equal(games.label, 'Games');
	assert.equal(games.icon, '🎮');
	assert.equal(games.hidden, undefined);
	assert.equal(currentAppRoute('/games/pong').href, '/games');
	assert.ok(searchAppRoutes('games').includes(games));
});

test('Living Library search requests and preserves comment results', async () => {
	const originalFetch = globalThis.fetch;
	let requestedUrl = '';
	globalThis.fetch = async url => {
		requestedUrl = String(url);
		return jsonResponse({
			success: {
				hits: [{ row: { postId: 'post-1' }, comments: [] }],
				commentHits: [{ id: 'comment-1' }]
			}
		});
	};
	try {
		const search = await searchLibrary({ query: 'kohen gadol', lane: 'meluket' });
		const request = new URL(requestedUrl, 'http://localhost');
		assert.equal(request.searchParams.get('comments'), 'true');
		assert.equal(request.searchParams.get('q'), 'kohen gadol');
		assert.equal(request.searchParams.get('lane'), 'meluket');
		assert.equal(search.commentHits[0].id, 'comment-1');
	} finally {
		globalThis.fetch = originalFetch;
	}
});

test('ranked comments merge into their source hit without duplication', () => {
	const source = {
		heichelId: 'ikar',
		seriesId: 'series-1',
		postId: 'post-1',
		aliasId: 'alias-1',
		subChunkIndex: 0,
		verseStart: 3,
		verseEnd: 4
	};
	const hits = [{
		row: source,
		comments: [{ found: true, row: { id: 'comment-1' } }]
	}];
	const ranked = [
		{ id: 'comment-1', row: { id: 'comment-1' }, parent: source },
		{ id: 'comment-2', row: { id: 'comment-2' }, parent: source }
	];
	const merged = mergeCommentHits(hits, ranked);
	assert.deepEqual(merged[0].comments.map(item => item.row.id), [
		'comment-1',
		'comment-2'
	]);
});

test('one comment source opens while empty menus stay absent', () => {
	const rangeSource = readSource('geelooy/mawgawl/sefarim/rangeResults.js');
	assert.ok(rangeSource.includes('commentMenu.open = openComments && comments.length > 0'));
	assert.ok(rangeSource.includes('commentMenu.hidden = comments.length === 0'));
});

test('the profile bar is wider on desktop and bounded on narrow screens', () => {
	const actionsCss = readSource('geelooy/style/geelooy-app/header/shell/actions.css');
	const mobileCss = readSource('geelooy/style/geelooy-app/header/mobile.css');
	assert.ok(actionsCss.includes('inline-size: clamp(12rem, 16vw, 15rem)'));
	assert.ok(actionsCss.includes('max-inline-size: 15rem'));
	assert.ok(mobileCss.includes('--g-mobile-profile-min: clamp(8.5rem, 24vw, 10rem)'));
	assert.ok(mobileCss.includes('--g-mobile-profile-min: clamp(7.75rem, 38vw, 9rem)'));
	assert.ok(mobileCss.includes('max-inline-size: 9.5rem'));
});
