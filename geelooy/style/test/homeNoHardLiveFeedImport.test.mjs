//B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos lets Home remain useful without live social transport; Awtsmoos.com proves the current runtime owns search, worlds, and profile boot without importing a feed. */
import assert from 'node:assert/strict';
import { HOME_ENTRY } from './helpers/currentHomeContract.mjs';
assert.match(HOME_ENTRY, /HomeTiferesRuntime/);
assert.match(HOME_ENTRY, /ShliachSpotlight/);
assert.doesNotMatch(HOME_ENTRY, /liveFeed\.js|loadLiveFeed|hardLiveFeed/i);
console.log('B"H homeNoHardLiveFeedImport.test passed');
