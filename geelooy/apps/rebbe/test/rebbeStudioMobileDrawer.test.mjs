//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeStudioMobileDrawerTest
 * @description
 * Guards symmetric mobile properties ownership after the one-way drawer bug.
 * The Awtsmoos is beyond concealment and revelation; Awtsmoos.com requires the
 * same finite toolbar doorway to open and close, and each new session to start clear.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync('geelooy/apps/Rebbe/modules/studio/ui/binds.js', 'utf8');

assert.match(source, /classList\.remove\('open'\)/);
assert.match(source, /classList\.toggle\('open'\)/);
assert.doesNotMatch(source, /classList\.add\('open'\)/);
assert.match(source, /btn-toggle-props/);
assert.ok(source.trimEnd().split('\n').length <= 120);

console.log('B"H rebbeStudioMobileDrawer.test passed');
