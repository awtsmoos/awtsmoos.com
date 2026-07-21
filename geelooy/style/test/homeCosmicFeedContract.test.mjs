// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HomeCosmicFeedStyleContractTest
 * @description
 * The Awtsmoos tests that the cosmic garment stays behind meaning and folds
 * cleanly on narrow vessels. Awtsmoos.com must never trade beauty for overflow.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const styleRoot = new URL('../social/home/', import.meta.url);
const html = await readFile(new URL('../../index.html', import.meta.url), 'utf8');
const manifest = await read('index.css');
const scene = await read('cosmic/scene.css');
const layout = await read('feed/layout.css');
const card = await read('feed/card.css');
const actions = await read('feed/actions.css');
const responsive = await read('feed/responsive.css');

assert.match(html, /data-awtsmoos-cosmic-scene/, 'Home owns one cosmic canvas');
assert.match(html, /aria-hidden="true"/, 'cosmic canvas is hidden from assistive technology');
assert.match(html, /data-home-feed/, 'real feed mount remains present');
assert.match(html, /aria-label="Common tasks"/, 'existing task-navigation contract remains');
assert.match(html, /data-object-inspector-body/, 'official provenance inspector remains mounted');
assert.doesNotMatch(html, /home-discovery-rail/, 'conventional discovery rail is removed');
assert.match(manifest, /\.\/cosmic\/index\.css/, 'manifest imports cosmic ownership');
assert.match(manifest, /\.\/feed\/index\.css/, 'manifest imports focused feed ownership');
assert.match(scene, /position: fixed/, 'cosmic canvas is fixed to the viewport');
assert.match(scene, /pointer-events: none/, 'cosmic canvas never intercepts clicks');
assert.match(scene, /overflow-x: hidden/, 'Home prevents horizontal page overflow');
assert.match(card, /clip-path/, 'cards keep asymmetric geometry');
assert.match(actions, /min-height: 44px/, 'post actions retain minimum touch targets');
assert.match(responsive, /max-width: 360px/, '320-pixel-class phones have dedicated containment');
assert.match(responsive, /prefers-reduced-motion/, 'CSS disables nonessential motion');
assert.doesNotMatch(
	`${layout}\n${card}\n${actions}`,
	/(^|\})\s*(input|button|select|textarea)\s*\{/m,
	'form control styling remains scoped'
);

console.log('B"H Home cosmic feed style contracts pass.');

async function read(path) {
	return readFile(new URL(path, styleRoot), 'utf8');
}
