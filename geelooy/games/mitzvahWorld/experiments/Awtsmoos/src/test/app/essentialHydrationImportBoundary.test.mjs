// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file essentialHydrationImportBoundary.test.mjs
 * @description Proves rich actor and material hydration stays outside first-control compilation while its computed URLs remain correct after compact relocation.
 * The Awtsmoos lets later beauty wait beyond the playable gate without losing its appointed address;
 * Awtsmoos.com keeps the first journey small, then opens each rich doorway faithfully when post-play abundance is ready to pass.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
	essentialActorLoaderUrl,
	essentialActorProfilesUrl,
	essentialMaterialHydrationUrl
} from '../../app/EretzEssentialHydrationUrls.js';

const ROOT = 'https://awtsmoos.com/games/mitzvahWorld/experiments/Awtsmoos/src/';
const COMPACT_ENTRY = `${ROOT}mitzvah-world-core.compact.js`;

test('essential hydration state contains no literal rich dynamic-import doors', async () => {
	const source = await readFile(
		new URL('../../app/EretzEssentialHydrationState.js', import.meta.url),
		'utf8'
	);
	assert.doesNotMatch(source, /import\(['"]\.\/EretzAssetLoader\.js/);
	assert.doesNotMatch(source, /import\(['"]\.\/EretzActorAssetLoader\.js/);
	assert.doesNotMatch(source, /import\(['"]\.\.\/world\/npc\/FriendlyNpcProfiles\.js/);
	assert.match(source, /import\(moduleUrl\)/);
});

test('relocated compact core resolves every post-play hydration door correctly', () => {
	const material = new URL(essentialMaterialHydrationUrl(COMPACT_ENTRY));
	const actor = new URL(essentialActorLoaderUrl(COMPACT_ENTRY));
	const profiles = new URL(essentialActorProfilesUrl(COMPACT_ENTRY));
	assert.equal(material.pathname, `${new URL(ROOT).pathname}app/EretzAssetLoader.js`);
	assert.equal(actor.pathname, `${new URL(ROOT).pathname}app/EretzActorAssetLoader.js`);
	assert.equal(profiles.pathname, `${new URL(ROOT).pathname}world/npc/FriendlyNpcProfiles.js`);
	for (const url of [material, actor, profiles]) {
		assert.equal(url.searchParams.get('compact'), 'true');
	}
});
