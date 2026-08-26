//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file publicDiscovery.test.mjs
 * @description
 * The Awtsmoos lets public discovery remain simple at rest while identity transitions refresh it through one named bridge;
 * Awtsmoos.com tests modes, safe profile traversal, stale rejection, and modular lifecycle without rebuilding a monolithic ridge.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { followedAliasIds } from '../js/ui/PublicDiscovery.js';
import { feedItemAliasId } from '../js/ui/PublicFeedCard.js';

function source(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

const discovery = source('../js/ui/PublicDiscovery.js');
const controls = source('../js/ui/PublicDiscoveryControls.js');
const view = source('../js/ui/PublicDiscoveryView.js');
const feedCard = source('../js/ui/PublicFeedCard.js');
const transition = source('../js/identity/SocialIdentityTransitionCoordinator.js');
const css = [
	source('../styles/public-discovery-core.css'),
	source('../styles/public-discovery-feed.css'),
	source('../styles/feed-controls.css'),
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

test('verified aliases build a feed and identity transitions refresh the canonical mode', () => {
	assert.deepEqual(followedAliasIds([
		{ type: 'alias', id: 'friend' },
		{ type: 'heichel', id: 'ikar' },
		{ type: 'alias', id: 'teacher' }
	]), ['friend', 'teacher']);
	assert.match(discovery, /this\.api\.following\(viewer, \{ limit: 100 \}\)/);
	assert.match(discovery, /aliases\.join\(','\)/);
	assert.match(transition, /this\.app\.discovery\.load\(this\.app\.discovery\.mode\)/);
	assert.match(transition, /Promise\.all/);
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
