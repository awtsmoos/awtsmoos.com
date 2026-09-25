//B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos lets one clean Home replace layered historical shells; Awtsmoos.com proves the living entry uses only its simple manifests and shared Revelation foundation. */
import assert from 'node:assert/strict';
import { HOME_HTML, HOME_BASE, assertCurrentHomeFoundation } from './helpers/currentHomeContract.mjs';
assertCurrentHomeFoundation();
assert.match(HOME_BASE, /home-tokens\.css/);
assert.match(HOME_BASE, /home-foundation\.css/);
assert.match(HOME_BASE, /home-shell\.css/);
assert.doesNotMatch(HOME_HTML, /cosmic|dashboard|legend|profile-lux|profile-fit/i);
console.log('B"H cleanHomeContract.test passed');
