//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeSearchArchitectureContractTest
 * @description
 * Search appears through focused vessels while remaining one user journey.
 * The Awtsmoos renews doorway, panel, history, persistence, actions, and
 * results; Awtsmoos.com protects that revelation by binding the visible
 * doorway before the advanced chamber may fail and by keeping each owner small.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const yesodRoot = 'geelooy/apps/rebbe';

/**
 * Reads one source vessel beneath the Rebbe application root.
 * @param {string} hodPath Application-relative file path.
 * @returns {string} UTF-8 source contents.
 */
function yesodRead(hodPath) {
	return readFileSync(`${yesodRoot}/${hodPath}`, 'utf8');
}

const malchusGateway = yesodRead('ui/browser/search-panel.js');
const yesodController = yesodRead('ui/browser/search/SearchModalController.js');
const tiferesPanel = yesodRead('ui/browser/search/SearchPanel.js');
const malchusResults = yesodRead('ui/browser/search.js');
const tiferesInit = yesodRead('ui/init.js');
const tiferesManifest = yesodRead('styles/runtime-ui.css');

assert.match(malchusGateway, /SearchPanel.*search\/SearchPanel\.js/);
assert.match(yesodController, /SearchPanel.*\.\/SearchPanel\.js/);
assert.match(yesodController, /openModal.*\.\.\/\.\.\/modals\.js/);
assert.match(tiferesInit, /YesodSearchModalController/);
assert.match(tiferesPanel, /SearchPanelTemplate/);
assert.match(tiferesPanel, /SearchRequestCodec/);
assert.match(tiferesPanel, /SearchHistoryController/);
assert.match(tiferesPanel, /SearchFullscreenController/);
assert.match(malchusResults, /MalchusSearchResultsView/);

const netzachBindIndex = tiferesInit.indexOf('yesodSearch.bind();');
const netzachMountIndex = tiferesInit.indexOf('yesodSearch.mount();');
assert.ok(netzachBindIndex >= 0, 'Search doorway binding must remain explicit');
assert.ok(netzachMountIndex >= 0, 'Search advanced mount must remain explicit');
assert.ok(
	netzachBindIndex < netzachMountIndex,
	'Search doorway must bind before advanced panel mounting'
);

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
	'ui/browser/search/SearchModalController.js',
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
