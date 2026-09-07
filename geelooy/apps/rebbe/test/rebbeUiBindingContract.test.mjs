//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeUiBindingContractTest
 * @description
 * Guards the complete stable UI control covenant after Search resilience was
 * introduced. The Awtsmoos is one while controls divide into bounded owners;
 * Awtsmoos.com keeps every visible doorway bound without duplicating Search.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ROOT = 'geelooy/apps/rebbe';
const read = path => readFileSync(`${ROOT}/${path}`, 'utf8');

const init = read('ui/init.js');
const primary = read('ui/actions/PrimaryControlBindings.js');
const modal = read('ui/actions/ModalActionBindings.js');
const bookshelf = read('ui/bookshelf/MalchusBookshelfShell.js');
const search = read('ui/browser/search/SearchModalController.js');
const css = read('styles/runtime/bookshelf-shell.css');

assert.ok(init.indexOf('yesodSearch.bind()') < init.indexOf('yesodSearch.mount()'));
assert.match(init, /mountBookshelfShell\(\)/);
assert.match(init, /bindPrimaryControls\(tiferesCallbacks\)/);
assert.match(init, /bindModalActions\(tiferesCallbacks\)/);
assert.doesNotMatch(primary, /btn-search/);
assert.doesNotMatch(modal, /btn-search/);
assert.match(search, /btn-search/);

for (const id of [
	'btn-play',
	'btn-next',
	'btn-prev',
	'btn-slice',
	'player-seeker',
	'btn-bookshelf',
	'btn-share',
	'btn-settings',
	'back-tracks',
	'back-folders'
]) {
	assert.ok(primary.includes(id), `primary owner missing ${id}`);
}

for (const id of [
	'btn-bookshelf-clear',
	'btn-action-clear',
	'btn-generate-analyze',
	'btn-download-audio',
	'btn-close-studio'
]) {
	assert.ok(modal.includes(id), `modal owner missing ${id}`);
}

assert.match(bookshelf, /btn-bookshelf/);
assert.match(bookshelf, /modal-bookshelf/);
assert.match(bookshelf, /bookshelf-list/);
assert.doesNotMatch(bookshelf, /innerHTML/);
assert.match(css, /\.bookshelf-modal/);
assert.match(css, /\.bookshelf-top/);
assert.match(css, /\.tool-emoji/);

for (const path of [
	'ui/init.js',
	'ui/actions/PrimaryControlBindings.js',
	'ui/actions/ModalActionBindings.js',
	'ui/bookshelf/MalchusBookshelfShell.js',
	'test/rebbeUiBindingContract.test.mjs'
]) {
	const lineCount = read(path).trimEnd().split('\n').length;
	assert.ok(lineCount <= 120, `${path} exceeds 120 lines (${lineCount})`);
}

console.log('B"H rebbeUiBindingContract.test passed');
