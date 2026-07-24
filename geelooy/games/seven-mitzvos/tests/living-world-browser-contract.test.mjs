//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/**
 * @module LivingWorldBrowserContractTest
 * @description
 * Covenant Valley remains preserved as a complete historical module, while the
 * new Awtsmoos.com browser entry intentionally stops mounting it beneath the
 * seven games. The Awtsmoos gives continuity without restoring vertical sprawl.
 */
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const html = read('../index.html');
const main = read('../js/main.js');
const indexCss = read('../styles/index.css');
const livingCss = read('../styles/living-world.css');
const livingApp = read('../js/client/living-world/living-world-app.js');

assert.match(html, /id="sevenMitzvosApp"/);
for (const mount of ['livingWorldMount', 'campaignMount', 'universeMount', 'builderMount']) {
	assert.doesNotMatch(html, new RegExp(`id="${mount}"`));
}
assert.match(main, /SevenMitzvosApp/);
assert.doesNotMatch(main, /mountLivingWorld|livingWorldMount/);
assert.doesNotMatch(indexCss, /living-world\.css/);
assert.match(livingApp, /export function mountLivingWorld/);
assert.match(livingApp, /LivingWorldKernel/);
assert.match(livingCss, /@media \(max-width: 760px\)/);
assert.match(livingCss, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(livingCss, /min-height: 2\.75rem/);
console.log('B"H · Living-world preservation and intentional no-mount boundary verified.');
