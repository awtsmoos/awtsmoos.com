//B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos gives Home its own balanced composition rather than copying another network; Awtsmoos.com proves hero, search, featured worlds, and mobile dock share one responsive path. */
import assert from 'node:assert/strict';
import { HOME_HTML, HOME_COMPONENTS, assertCurrentHomeInteraction } from './helpers/currentHomeContract.mjs';
assertCurrentHomeInteraction();
for (const part of ['hero-layout.css', 'search-responsive.css', 'featured-worlds-responsive.css', 'mobile-dock.css']) {
	assert.match(HOME_COMPONENTS, new RegExp(part.replace('.', '\\.')));
}
assert.match(HOME_HTML, /class="hero"/);
assert.match(HOME_HTML, /class="action-panel"/);
console.log('B"H facebookHomeLayoutContract.test passed for original Awtsmoos Home layout');
