//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeSearchArchitectureContractTest
 * @description
 * Search appears through focused vessels while remaining one user journey.
 * The Awtsmoos renews doorway, dynamic surface, sticky escape, history, actions,
 * and results; Awtsmoos.com keeps each owner bounded, reachable, and clear.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = 'geelooy/apps/Rebbe';
const read = path => readFileSync(`${root}/${path}`, 'utf8');
const controller = read('ui/browser/search/SearchModalController.js');
const surface = read('ui/browser/search/SearchModalSurface.js');
const panel = read('ui/browser/search/SearchPanel.js');
const template = read('ui/browser/search/SearchPanelTemplate.js');
const init = read('ui/init.js');
const manifest = read('styles/runtime-ui.css');

assert.match(controller, /SearchModalSurface/);
assert.doesNotMatch(controller, /createElement/);
assert.match(surface, /closeModal.*\.\.\/\.\.\/modals\.js/);
assert.match(surface, /\.modal-close/);
assert.match(panel, /SearchPanelTemplate/);
assert.match(panel, /SearchRequestCodec/);
assert.match(panel, /SearchHistoryController/);
assert.equal((template.match(/modal-close/g) || []).length, 1, 'Search template needs one Close');
assert.match(template, /sticky-actions[\s\S]*modal-close/);
assert.doesNotMatch(template, /lower-actions[\s\S]*modal-close/);
assert.match(init, /YesodSearchModalController/);
assert.ok(init.indexOf('yesodSearch.bind();') < init.indexOf('yesodSearch.mount();'));
for (const css of [
	'search-shell.css',
	'search-history.css',
	'search-controls.css',
	'search-control-interaction.css',
	'search-results.css',
	'search-event-cards.css',
	'search-tracks.css',
	'search-fullscreen.css'
]) {
	assert.ok(manifest.includes(css), `runtime manifest missing ${css}`);
}
for (const path of [
	'ui/browser/search/SearchModalController.js',
	'ui/browser/search/SearchModalSurface.js',
	'ui/browser/search/SearchPanel.js',
	'ui/browser/search/SearchPanelTemplate.js',
	'ui/browser/search/SearchRequestCodec.js',
	'ui/browser/search/SearchFullscreenController.js',
	'ui/browser/search/SearchHistoryController.js',
	'ui/browser/search/SearchHistoryPersistence.js',
	'ui/browser/search/SearchPanelActions.js',
	'ui/browser/search/SearchEventCard.js'
]) {
	assert.ok(read(path).trimEnd().split('\n').length <= 120, `${path} exceeds 120 lines`);
}
console.log('B"H rebbeSearchArchitectureContract.test passed');
