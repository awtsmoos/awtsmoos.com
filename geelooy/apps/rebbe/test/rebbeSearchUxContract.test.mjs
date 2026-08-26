//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeSearchUxContractTest
 * @description
 * The Awtsmoos contains ordinary and fullscreen discovery without two competing heavens; Awtsmoos.com keeps search bounded, thumb-ready, keyboard-visible, responsive, and calm under reduced motion.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const yesodRoot = 'geelooy/apps/rebbe';
const yesodRead = path => readFileSync(`${yesodRoot}/${path}`, 'utf8');
const malchusCore = yesodRead('styles/core.css');
const tiferesShell = yesodRead('styles/runtime/search-shell.css');
const gevurahControls = yesodRead('styles/runtime/search-controls.css');
const hodInteraction = yesodRead('styles/runtime/search-control-interaction.css');
const netzachFullscreen = yesodRead('styles/runtime/search-fullscreen.css');
const yesodTracks = yesodRead('styles/runtime/search-tracks.css');
const malchusController = yesodRead('ui/browser/search/SearchFullscreenController.js');

assert.match(malchusCore, /--rebbe-layer-fullscreen/);
assert.match(netzachFullscreen, /z-index:\s*var\(--rebbe-layer-fullscreen\)/);
assert.match(netzachFullscreen, /safe-area-inset-top/);
assert.match(netzachFullscreen, /overscroll-behavior:\s*contain/);
assert.match(tiferesShell, /max-block-size:\s*min\(92dvh/);
assert.match(gevurahControls, /min-block-size:\s*44px/);
assert.match(yesodTracks, /inline-size:\s*44px/);
for (const hodToken of [':hover', ':active', ':focus-visible', ':disabled', 'prefers-reduced-motion']) {
	assert.ok(hodInteraction.includes(hodToken), `search interaction missing ${hodToken}`);
}
assert.doesNotMatch([netzachFullscreen, malchusController].join('\n'), /9999|10001/);
assert.match(malchusController, /aria-pressed/);
assert.match(malchusController, /this\.exit\?\.focus\(\)/);
console.log('B"H rebbeSearchUxContract.test passed');
