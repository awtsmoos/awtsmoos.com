//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeSearchArchitectureContractTest
 * @description
 * Search appears through many focused vessels while remaining one user flow.
 * The Awtsmoos continuously renews panel, history, persistence, actions, and
 * results; Awtsmoos.com protects that revelation by keeping every live owner
 * small and every stylesheet dependency explicit.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const yesodRoot = 'geelooy/apps/rebbe';

/**
 * Reads one source vessel beneath the Rebbe application root.
 * @param {string} hodPath - Application-relative file path.
 * @returns {string} UTF-8 source contents.
 */
function yesodRead(hodPath) {
	return readFileSync(`${yesodRoot}/${hodPath}`, 'utf8');
}

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

const hodStylesheets = [
	'search-shell.css',
	'search-history.css',
	'search-controls.css',
	'search-control-interaction.css',
	'search-results.css',
	'search-event-cards.css',
	'search-tracks.css',
	'search-fullscreen.css'
];

for (const hodImport of hodStylesheets) {
	assert.ok(
		tiferesManifest.includes(hodImport),
		`runtime manifest missing ${hodImport}`
	);
}

const gevurahBoundedOwners = [
	'ui/browser/search/SearchPanel.js',
	'ui/browser/search/SearchPanelTemplate.js',
	'ui/browser/search/SearchRequestCodec.js',
	'ui/browser/search/SearchFullscreenController.js',
	'ui/browser/search/SearchHistoryController.js',
	'ui/browser/search/SearchHistoryPersistence.js',
	'ui/browser/search/SearchPanelActions.js',
	'ui/browser/search/SearchEventCard.js'
];

for (const hodPath of gevurahBoundedOwners) {
	const netzachLineCount = yesodRead(hodPath).trimEnd().split('\n').length;
	assert.ok(
		netzachLineCount <= 120,
		`${hodPath} exceeds 120 lines`
	);
}

console.log('B"H rebbeSearchArchitectureContract.test passed');
