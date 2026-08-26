//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file publicDiscovery.test.mjs
 * @description Proves public discovery keeps asynchronous query mechanics in its Binah loader while the visual orchestrator remains small, truthful, cancellable, and profile-safe.
 * The Awtsmoos renews loader and view before either can claim the whole social river;
 * Awtsmoos.com lets Binah gather changing data while Malchus renders one calm, reachable, mobile-safe giver.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { followedAliasIds } from '../js/ui/PublicDiscoveryLoader.js';
import { feedItemAliasId } from '../js/ui/PublicFeedCard.js';

/** Reads one Social Hub authority without duplicating its implementation inside the test. */
function source(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

const discovery = source('../js/ui/PublicDiscovery.js');
const loader = source('../js/ui/PublicDiscoveryLoader.js');
const controls = source('../js/ui/PublicDiscoveryControls.js');
const view = source('../js/ui/PublicDiscoveryView.js');
const feedCard = source('../js/ui/PublicFeedCard.js');
const transition = source('../js/identity/SocialIdentityTransitionCoordinator.js');
const css = [
	source('../styles/public-discovery-core.css'),
	source('../styles/public-discovery-feed.css'),
	source('../styles/feed-controls-layout.css'),
	source('../styles/feed-controls-states.css'),
	source('../styles/social-network-core.css'),
	source('../styles/social-network-actions.css')
].join('\n');

test('logged-out discovery keeps honest modes while loading stays outside the view orchestrator', () => {
	assert.match(controls, /\['latest',\s*'Latest'\]/);
	assert.match(controls, /\['trending',\s*'Trending'\]/);
	assert.match(view, /Open a public profile by alias/);
	assert.match(view, /The public feed is quiet right now/);
	assert.match(loader, /this\.api\.feed/);
	assert.match(loader, /this\.api\.trending/);
	assert.doesNotMatch(discovery, /this\.api\.(?:feed|trending|following)/);
});

test('verified aliases build following-aware queries through the loader boundary', () => {
	assert.deepEqual(followedAliasIds([
		{ type: 'alias', id: 'friend' },
		{ type: 'heichel', id: 'ikar' },
		{ type: 'alias', id: 'teacher' }
	]), ['friend', 'teacher']);
	assert.match(loader, /this\.api\.following\(viewer, \{ limit: 100 \}\)/);
	assert.match(loader, /aliases:\s*aliases\.join\(','\)/);
	assert.match(transition, /this\.app\.discovery\.load\(this\.app\.discovery\.mode\)/);
});

test('discovery supersession uses grouped abortable operations instead of local sequence counters', () => {
	assert.match(loader, /this\.operations\.query\('public-discovery'/);
	assert.match(loader, /group:\s*'public-discovery'/);
	assert.match(loader, /signal\.aborted/);
	assert.match(loader, /AbortError/);
	assert.match(discovery, /error\?\.name === 'AbortError'/);
	assert.doesNotMatch(discovery, /loadSequence|requestId !==/);
});

test('nested legacy author identity remains a safe profile doorway', () => {
	assert.equal(feedItemAliasId({ author: { aliasId: 'rebbe' } }), 'rebbe');
	assert.match(feedCard, /publicFeedCard__profile/);
	assert.match(feedCard, /onOpenProfile/);
	assert.doesNotMatch(feedCard, /innerHTML|insertAdjacentHTML/);
});

test('discovery controls stay touch-reachable and avoid blur-heavy global styling', () => {
	assert.match(css, /min-(?:height|block-size):\s*(?:44|46|48)px/);
	assert.match(css, /button:hover/);
	assert.match(css, /button:active/);
	assert.match(css, /button:focus-visible/);
	assert.doesNotMatch(css, /backdrop-filter|filter\s*:\s*blur/i);
});
