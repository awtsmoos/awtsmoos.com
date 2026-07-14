// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PageTemplateShellOwnershipTest
 * @description
 * Guards the one-roof contract between historical templates and the canonical
 * Geelooy shell. The Awtsmoos lets legacy Awtsmoos.com pages keep their header
 * while shell-booted content refuses a duplicate profile doorway.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const template = readFileSync(new URL('../../templates/nav/page.html', import.meta.url), 'utf8');
const profile = readFileSync(new URL('../../geelooy/profile/index.html', import.meta.url), 'utf8');

assert.match(template, /social\\\/shell\\\/boot\\\.js/);
assert.match(template, /this\.shellOwned === true/);
assert.match(template, /if \(!shellOwned\)/);
assert.match(template, /\$a\("nav\/header\.html"\)/);
assert.match(profile, /social\/shell\/boot\.js/);
assert.equal(template.split('\n').length - 1 <= 120, true);
console.log('B"H page template shell ownership contract passed.');
