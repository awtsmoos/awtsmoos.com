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
const malchusResults = yesodRead('styles/runtime/search-results.css');
const chesedMobile = yesodRead('styles/runtime/search-mobile.css');
const hodInteraction = yesodRead('styles/runtime/search-control-interaction.css');
const netzachFullscreen = yesodRead('styles/runtime/search-fullscreen.css');
const yesodTracks = yesodRead('styles/runtime/search-tracks.css');
const malchusController = yesodRead('ui/browser/search/SearchFullscreenController.js');
const mobilePolish = yesodRead('styles/mobile-polish.css');
const indexHtml = yesodRead('index.html');
const chesedActions = yesodRead('ui/browser/search/SearchPanelActions.js');

assert.match(malchusCore, /--rebbe-layer-fullscreen/);
assert.match(netzachFullscreen, /z-index:\s*var\(--rebbe-layer-fullscreen\)/);
assert.match(netzachFullscreen, /safe-area-inset-top/);
assert.match(netzachFullscreen, /overscroll-behavior:\s*contain/);
assert.match(tiferesShell, /max-block-size:\s*min\(92dvh/);
assert.match(gevurahControls, /min-block-size:\s*44px/);
assert.match(yesodTracks, /inline-size:\s*44px/);
assert.match(malchusResults, /flex:\s*0 0 min\(48dvh, 420px\)/);
assert.match(malchusResults, /min-block-size:\s*260px/);
assert.match(malchusResults, /overflow-y:\s*auto/);
assert.match(chesedMobile, /max-width:\s*calc\(100vw - 10px\) !important/);
assert.match(chesedMobile, /padding:\s*12px !important/);
for (const hodToken of [':hover', ':active', ':focus-visible', ':disabled', 'prefers-reduced-motion']) {
	assert.ok(hodInteraction.includes(hodToken), `search interaction missing ${hodToken}`);
}
assert.doesNotMatch([netzachFullscreen, malchusController].join('\n'), /9999|10001/);
assert.match(malchusController, /aria-pressed/);
assert.match(malchusController, /this\.exit\?\.focus\(\)/);
assert.match(indexHtml, /mobile-polish\.css\?v=rebbe-mobile-002/);
assert.match(mobilePolish, /grid-template-columns:\s*repeat\(auto-fit, minmax\(46px, 1fr\)\)/);
assert.match(mobilePolish, /grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\)/);
assert.match(mobilePolish, /\.search-summary[\s\S]*position:\s*static\s*!important/);
assert.match(mobilePolish, /overflow-y:\s*auto\s*!important/);
assert.match(mobilePolish, /\.search-results-content[\s\S]*overflow:\s*visible\s*!important/);
assert.match(malchusController, /ownerDocument\?\.body/);
assert.match(malchusController, /body\.append\(this\.results\)/);
assert.match(chesedActions, /matchMedia\?\.\('\(max-width: 720px\)'\)/);
assert.match(yesodRead('styles/runtime/search-results.css'), /touch-action:\s*pan-y/);
assert.doesNotMatch(yesodRead('styles/runtime/search-results.css'), /overflow:\s*clip/);
console.log('B"H rebbeSearchUxContract.test passed');
