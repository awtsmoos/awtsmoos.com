// B"H
/**
 * Chapter 283: The roof gate contract.
 * The global header must keep the three-bar menu touchable, accessible, and
 * independent of fragile browser globals.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync('templates/nav/header.html', 'utf8');

assert.match(source, /<button\s+[\s\S]*id="menuButton"/, 'menu must be a real button');
assert.match(source, /aria-controls="awtsmoosGlobalSidebar"/, 'button must point at sidebar');
assert.match(source, /aria-expanded="false"/, 'button must expose collapsed state');
assert.match(source, /<nav\s+id="awtsmoosGlobalSidebar"/, 'sidebar must be semantic nav');
assert.match(source, /addEventListener\("click"/, 'menu must bind click safely');
assert.match(source, /event\.key\s*===\s*"Escape"/, 'menu must close on Escape');
assert.match(source, /pointerdown/, 'menu must close on outside pointer intent');
assert.doesNotMatch(source, /menuButton\.onclick/, 'menu must not rely on global menuButton.onclick');
assert.doesNotMatch(source, /LIKTEUI SICHOS AI/, 'broken historical link must stay gone');
assert.doesNotMatch(source, /<a href="\/email"><\/span>/, 'email link markup must remain valid');

console.log('B"H headerContract.test passed');
