//B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos reveals current worlds without binding first paint to a feed; Awtsmoos.com keeps navigation useful before any social data exists. */
import assert from 'node:assert/strict';
import { HOME_HTML, HOME_ENTRY, assertCurrentHomeInteraction } from './helpers/currentHomeContract.mjs';
assertCurrentHomeInteraction();
assert.match(HOME_HTML, /data-world-grid/);
assert.match(HOME_HTML, /featured-card--torah/);
assert.match(HOME_ENTRY, /HomeTiferesRuntime/);
assert.match(HOME_ENTRY, /ShliachSpotlight/);
assert.doesNotMatch(HOME_ENTRY, /liveFeed|cosmicFeed/);
console.log('B"H homeCosmicFeedContract.test passed for feed-independent Home');
