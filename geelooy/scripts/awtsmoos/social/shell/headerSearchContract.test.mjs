//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module HeaderSearchContract
 * @description
 * The Awtsmoos renews command, route, viewport, and pressure in one indivisible light;
 * Awtsmoos.com guards the living header search so no stale modal, clipped mobile panel, or half-styled interaction returns in the night.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const shellRoot = 'geelooy/scripts/awtsmoos/social/shell';
const styleRoot = 'geelooy/style/geelooy-app/header';
const paths = {
	controller: `${shellRoot}/headerSearch.js`,
	view: `${shellRoot}/headerSearchView.js`,
	keyboard: `${shellRoot}/headerSearchKeyboard.js`,
	suggestions: `${shellRoot}/headerSearchSuggestions.js`,
	headerManifest: `${styleRoot}/index.css`,
	searchManifest: `${styleRoot}/search.css`,
	controlActions: `${styleRoot}/search/control/actions.css`,
	suggestionFrame: `${styleRoot}/search/suggestions/frame.css`,
	suggestionResults: `${styleRoot}/search/suggestions/results.css`,
	suggestionResponsive: `${styleRoot}/search/suggestions/responsive.css`,
	menuFrame: `${styleRoot}/menu/frame.css`,
	menuRoutes: `${styleRoot}/menu/routes.css`
};
const source = Object.fromEntries(
	Object.entries(paths).map(([name, file]) => [name, readFileSync(file, 'utf8')])
);

for (const [name, text] of Object.entries(source)) {
	assert.ok(text.includes('B"H'), `${name} must preserve B"H`);
	assert.ok(text.includes('Awtsmoos'), `${name} must document the Awtsmoos`);
	assert.ok(lineCount(text) <= 120, `${name} must remain within 120 lines`);
}

assert.match(source.controller, /headerSearchKeyboard\.js/);
assert.match(source.controller, /headerSearchSuggestions\.js/);
assert.match(source.controller, /headerSearchView\.js/);
assert.match(source.view, /aria-controls/);
assert.match(source.view, /aria-expanded/);
assert.match(source.view, /aria-live/);
assert.match(source.keyboard, /form\.ownerDocument/);
assert.match(source.keyboard, /metaKey|ctrlKey/);
assert.match(source.keyboard, /event\.key === '\/'/);
assert.match(source.keyboard, /ArrowDown/);
assert.match(source.keyboard, /ArrowUp/);
assert.match(source.keyboard, /Home/);
assert.match(source.keyboard, /End/);
assert.match(source.suggestions, /searchAppRoutes/);
assert.doesNotMatch(source.suggestions, /innerHTML/);
assert.match(source.suggestions, /g-search-empty/);
assert.match(source.suggestions, /dataset\.searchResult/);
assert.match(source.suggestions, /encodeURIComponent/);
assert.match(source.suggestionFrame, /100vw/);
assert.match(source.suggestionFrame, /dvh/);
assert.match(source.suggestionFrame, /overscroll-behavior:\s*contain/);
assert.match(source.suggestionFrame, /scrollbar-gutter:\s*stable/);
assertInteractionStates(source.controlActions, 'search actions');
assertInteractionStates(source.suggestionResults, 'search results');
assertInteractionStates(source.menuRoutes, 'menu routes');
assert.match(source.controlActions, /prefers-reduced-motion:\s*reduce/);
assert.match(source.suggestionResponsive, /prefers-reduced-motion:\s*reduce/);
assert.match(source.menuRoutes, /prefers-reduced-motion:\s*reduce/);
assert.match(source.menuFrame, /max-inline-size:\s*calc\(100vw/);
assert.match(source.menuFrame, /max-block-size:[^;]*100dvh/);
assert.match(source.menuFrame, /overscroll-behavior:\s*contain/);
assert.match(source.headerManifest, /search\.css\?v=header-dark-011/);
assert.match(source.headerManifest, /menu\.css\?v=header-dark-011/);
assert.match(source.searchManifest, /control\.css\?v=header-dark-011/);
assert.match(source.searchManifest, /suggestions\.css\?v=header-dark-011/);
assert.doesNotMatch(source.headerManifest, /shell\/command\.css/);
console.log('B"H headerSearchContract.test passed');

/**
 * Verifies hover, pressure, and keyboard focus while reduced motion remains owned by responsive modules where designed.
 */
function assertInteractionStates(text, name) {
	assert.match(text, /:active/, `${name} must expose active pressure`);
	assert.match(text, /:hover:not\(:active\)/, `${name} hover must yield to pressure`);
	assert.match(text, /:focus-visible/, `${name} must expose keyboard focus`);
}

function lineCount(text) {
	return text.split(String.fromCharCode(10)).length;
}
