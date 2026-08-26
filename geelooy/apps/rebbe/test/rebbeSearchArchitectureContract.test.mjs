//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeSearchArchitectureContractTest
 * @description
 * The Awtsmoos is one while panel, history, actions, cards, and fullscreen appear apart; Awtsmoos.com protects that modular revelation by requiring small live owners and one static stylesheet graph.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const yesodRoot = 'geelooy/apps/rebbe';
const yesodRead = path => readFileSync(`${yesodRoot}/${path}`, 'utf8');
const malchusGateway = yesodRead('ui/browser/search-panel.js');
const tiferesPanel = yesodRead('ui/browser/search/SearchPanel.js');
const malchusResults = yesodRead('ui/browser/search.js');
const tiferesManifest = yesodRead('styles/runtime-ui.css');

assert.match(malchusGateway, /SearchPanel.*search\/SearchPanel\.js/);
assert.match(tiferesPanel, /SearchPanelTemplate/);
assert.match(tiferesPanel, /SearchRequestCodec/);
assert.match(tiferesPanel, /SearchHistoryController/);
assert.match(tiferesPanel, /SearchFullscreenController/);
assert.match(malchusResults, /MalchusSearchResultsView/);

for (const hodImport of [
	'search-shell.css',
	'search-history.css',
	'search-controls.css',
	'search-control-interaction.css',
	'search-results.css',
	'search-event-cards.css',
	'search-tracks.css',
	'search-fullscreen.css'
]) {
	assert.ok(tiferesManifest.includes(hodImport), `runtime manifest missing ${hodImport}`);
}

for (const hodPath of [
	'ui/browser/search/SearchPanel.js',
	'ui/browser/search/SearchPanelTemplate.js',
	'ui/browser/search/SearchRequestCodec.js',
	'ui/browser/search/SearchFullscreenController.js',
	'ui/browser/search/SearchHistoryController.js',
	'ui/browser/search/SearchPanelActions.js',
	'ui/browser/search/SearchEventCard.js'
]) {
	assert.ok(yesodRead(hodPath).trimEnd().split('\n').length <= 120, `${hodPath} exceeds 120 lines`);
}
console.log('B"H rebbeSearchArchitectureContract.test passed');
