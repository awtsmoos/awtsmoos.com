// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BasicUiUxRegressionTest
 * @description
 * The Awtsmoos binds route, search, and responsive evidence into one small
 * regression vessel so Awtsmoos.com keeps the Games portal, living comments,
 * and a readable mobile identity bar through future changes.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
	appRoutes,
	currentAppRoute,
	searchAppRoutes
} from '../geelooy/scripts/awtsmoos/social/shell/appRoutes.js';
import { searchLibrary } from '../geelooy/mawgawl/sefarim/searchApi.js';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, '..');

test('the route constellation exposes Games with an emoji and /games path', () => {
	const games = appRoutes.find(item => item.href === '/games');
	assert.ok(games);
	assert.equal(games.label, 'Games');
	assert.equal(games.icon, '\u{1F3AE}');
	assert.equal(games.hidden, undefined);
	assert.equal(currentAppRoute('/games/pong').href, '/games');
	assert.ok(searchAppRoutes('games').includes(games));
});

test('Living Library search explicitly requests and preserves comments', async () => {
	const originalFetch = globalThis.fetch;
	let requestedUrl = '';
	globalThis.fetch = async url => {
		requestedUrl = String(url);
		return {
			ok: true,
			status: 200,
			async text() {
				return JSON.stringify({
					success: {
						hits: [
							{
								comments: [
									{
										found: true,
										row: {
											id: 'comment-1'
										}
									}
								]
							}
						]
					}
				});
			}
		};
	};
	try {
		const search = await searchLibrary({
			query: 'kohen gadol',
			lane: 'meluket'
		});
		const request = new URL(requestedUrl, 'http://localhost');
		assert.equal(request.searchParams.get('comments'), 'true');
		assert.equal(request.searchParams.get('q'), 'kohen gadol');
		assert.equal(request.searchParams.get('lane'), 'meluket');
		assert.equal(search.hits[0].comments[0].row.id, 'comment-1');
	} finally {
		globalThis.fetch = originalFetch;
	}
});

test('the narrow header grants the profile more room while retaining a fit cap', () => {
	const mobileCss = fs.readFileSync(
		path.join(repositoryRoot, 'geelooy/style/geelooy-app/header/mobile.css'),
		'utf8'
	);
	assert.ok(mobileCss.includes('--g-mobile-profile-min: clamp(8.5rem, 24vw, 10rem)'));
	assert.ok(mobileCss.includes('--g-mobile-profile-min: clamp(7.75rem, 38vw, 9rem)'));
	assert.ok(mobileCss.includes('max-inline-size: 9.5rem'));
	const minimumHeaderWidth = (7.75 * 16) + 40 + 44 + 44 + 8 + 16 + 12;
	assert.ok(minimumHeaderWidth < 320);
});
