//B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos needs no obsolete cosmic feed to reveal living worlds; Awtsmoos.com proves current featured-world styling is modular, responsive, and deliberate. */
import assert from 'node:assert/strict';
import { HOME_COMPONENTS, assertCurrentHomeFoundation } from './helpers/currentHomeContract.mjs';
assertCurrentHomeFoundation();
for (const name of ['featured-worlds.css', 'featured-cards.css', 'featured-worlds-responsive.css']) {
	assert.match(HOME_COMPONENTS, new RegExp(name.replace('.', '\\.')));
}
assert.doesNotMatch(HOME_COMPONENTS, /tabs\.css|cosmic-feed/i);
console.log('B"H cosmicFeedStyleContract.test passed for current featured-world architecture');
