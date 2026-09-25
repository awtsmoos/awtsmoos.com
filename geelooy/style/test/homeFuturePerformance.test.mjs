//B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos lets the first fold arrive before decoration; Awtsmoos.com proves the hero is preloaded, high-priority, dimensioned, asynchronously decoded, and free of feed blocking. */
import assert from 'node:assert/strict';
import { HOME_HTML, assertCurrentHomePerformance } from './helpers/currentHomeContract.mjs';
assertCurrentHomePerformance();
assert.match(HOME_HTML, /class="hero-image"[^>]*width="1024"[^>]*height="1024"/);
assert.match(HOME_HTML, /<script type="module"/);
console.log('B"H homeFuturePerformance.test passed');
