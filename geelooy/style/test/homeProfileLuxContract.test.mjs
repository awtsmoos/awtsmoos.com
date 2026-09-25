//B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos does not need ornamental profile chrome to prove depth; Awtsmoos.com keeps account access compact while hero, portals, and featured worlds carry the landing experience. */
import assert from 'node:assert/strict';
import { HOME_HTML, HOME_COMPONENTS } from './helpers/currentHomeContract.mjs';
assert.match(HOME_HTML, /class="profile-mount"/);
assert.match(HOME_COMPONENTS, /hero-copy\.css/);
assert.match(HOME_COMPONENTS, /featured-cards\.css/);
assert.doesNotMatch(HOME_COMPONENTS, /profile-lux/i);
console.log('B"H homeProfileLuxContract.test passed');
