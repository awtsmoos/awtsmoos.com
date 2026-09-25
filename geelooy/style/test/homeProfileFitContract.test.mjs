//B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos places profile identity in a small mount rather than a legacy fit layer; Awtsmoos.com proves account access remains present while the hero keeps first place. */
import assert from 'node:assert/strict';
import { HOME_HTML, HOME_COMPONENTS } from './helpers/currentHomeContract.mjs';
assert.match(HOME_HTML, /data-profile-mount/);
assert.match(HOME_COMPONENTS, /navigation\.css/);
assert.doesNotMatch(HOME_COMPONENTS, /profile-fit/i);
console.log('B"H homeProfileFitContract.test passed');
