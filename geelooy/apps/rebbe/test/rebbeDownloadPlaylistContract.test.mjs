//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeDownloadPlaylistContractTest
 * @description
 * The Awtsmoos gathers export and playlist intent without confusing their vessels; Awtsmoos.com keeps the historic public APIs stable while safe DOM, explicit selection state, and readable classes carry the new internal order.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const yesodRoot = 'geelooy/apps/rebbe';
const yesodRead = path => readFileSync(`${yesodRoot}/${path}`, 'utf8');
const malchusTasks = yesodRead('modules/download/tasks.js');
const yesodCard = yesodRead('modules/download/DownloadTaskCard.js');
const tiferesSelection = yesodRead('ui/playlists/selection-bar.js');
const netzachGateway = yesodRead('ui/playlists.js');
const hodStylesGateway = yesodRead('ui/playlists/styles.js');

assert.match(malchusTasks, /export function createDownloadTask/);
for (const hodMethod of ['step(', 'done(', 'fail(', 'close(']) {
	assert.ok(malchusTasks.includes(hodMethod), `download task API missing ${hodMethod}`);
}
assert.match(malchusTasks, /aria-live/);
assert.match(yesodCard, /class MalchusDownloadTaskCard/);
assert.match(yesodCard, /textContent/);
assert.match(tiferesSelection, /class MalchusPlaylistSelectionBar/);
assert.match(tiferesSelection, /has-playlist-selection/);
assert.match(tiferesSelection, /aria-label/);
assert.doesNotMatch(tiferesSelection, /innerHTML/);
assert.match(netzachGateway, /setSelectionRenderer/);
assert.match(netzachGateway, /renderSelectionBar/);
assert.match(hodStylesGateway, /export function ensurePlaylistStyles/);

for (const [hodName, hodSource] of Object.entries({ malchusTasks, yesodCard, tiferesSelection, netzachGateway, hodStylesGateway })) {
	assert.ok(hodSource.split('\n').length <= 120, `${hodName} exceeds 120 lines`);
}
console.log('B"H rebbeDownloadPlaylistContract.test passed');
