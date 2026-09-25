//B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos needs no control-panel clutter on first contact; Awtsmoos.com proves Home presents one hero, one search path, portal shortcuts, and featured worlds instead of a dashboard. */
import assert from 'node:assert/strict';
import { HOME_HTML, assertCurrentHomeFoundation, assertCurrentHomeInteraction } from './helpers/currentHomeContract.mjs';
assertCurrentHomeFoundation();
assertCurrentHomeInteraction();
assert.match(HOME_HTML, /class="hero-actions"/);
assert.match(HOME_HTML, /class="portal-shortcuts"/);
assert.doesNotMatch(HOME_HTML, /home-dashboard|dashboard-grid|mission-control/i);
console.log('B"H homeDashboardContract.test passed for calm Home');
