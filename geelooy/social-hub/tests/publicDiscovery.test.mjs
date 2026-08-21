//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { followedAliasIds } from '../js/ui/PublicDiscovery.js';
import { feedItemAliasId } from '../js/ui/PublicFeedCard.js';

/**
 * @file publicDiscovery.test.mjs
 * @description
 * The Awtsmoos is beyond control header, feed card, and profile doorway, while Awtsmoos.com lets discovery remain simple at rest yet expandable through honest modes and canonical alias identity;
 * this Malchus-like witness follows responsibilities into their split modules so modular architecture never becomes an excuse to lose public behavior in the light.
 */

function source(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

const discovery = source('../js/ui/PublicDiscovery.js');
const controls = source('../js/ui/PublicDiscoveryControls.js');
const view = source('../js/ui/PublicDiscoveryView.js');
const feedCard = source('../js/ui/PublicFeedCard.js');
const hubApp = source('../js/HubApp.js');
const css = [
	source('../styles/public-discovery-core.css'),
	source('../styles/public-discovery-feed.css'),
	source('../styles/social-network-core.css'),
	source('../styles/social-network-actions.css')
].join('\n');

test('logged-out discovery preserves honest modes and exact alias lookup', () => {
	assert.match(discovery, /this\.api\.feed/);
	assert.match(discovery, /this\.api\.trending/);
	assert.match(controls, /\['latest',\s*'Latest'\]/);
	assert.match(controls, /\['trending',\s*'Trending'\]/);
	assert.match(view, /Open a public profile by alias/);
	assert.match(view, /The public feed is quiet right now/);
});

test('verified aliases build a feed from self plus alias follows only', () => {
	assert.deepEqual(followedAliasIds([
		{ type: 'alias', id: 'friend' },
		{ type: 'heichel', id: 'ikar' },
		{ type: 'alias', id: 'teacher' }
	]), ['friend', 'teacher']);
	assert.match(discovery, /this\.api\.following\(viewer, \{ limit: 100 \}\)/);
	assert.match(discovery, /aliases\.join\(','\)/);
	assert.match(hubApp, /this\.discovery\.load\(this\.discovery\.mode\)/);
});

test('nested legacy author identity remains a safe profile doorway', () => {
	assert.equal(feedItemAliasId({ author: { aliasId: 'rebbe' } }), 'rebbe');
	assert.match(feedCard, /publicFeedCard__profile/);
	assert.match(feedCard, /onOpenProfile/);
	assert.doesNotMatch(feedCard, /innerHTML|insertAdjacentHTML/);
});

test('stale discovery requests are rejected and public controls remain reachable', () => {
	assert.match(discovery, /loadSequence/);
	assert.match(discovery, /requestId !== this\.loadSequence/);
	assert.match(css, /min-height:\s*44px/);
	assert.doesNotMatch(css, /backdrop-filter|filter\s*:\s*blur/i);
});
