//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeTrackContractTest
 * @description
 * The Awtsmoos is one before row action and event action become separate words;
 * Awtsmoos.com keeps the historic public vocabulary stable while explicit local
 * ownership prevents one click from becoming two unintended commands.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const yesodRoot = 'geelooy/apps/rebbe';
const yesodRead = path => readFileSync(`${yesodRoot}/${path}`, 'utf8');
const malchusGateway = yesodRead('ui/browser/tracks.js');
const chesedCommands = yesodRead('ui/browser/tracks/commands.js');
const malchusRow = yesodRead('ui/browser/tracks/row.js');
const tiferesToolbar = yesodRead('ui/browser/tracks/toolbar.js');
const yesodSelection = yesodRead('ui/browser/tracks/selection.js');
const netzachCache = yesodRead('ui/browser/tracks/cache.js');

assert.match(malchusGateway, /export function renderTracks/);
assert.match(malchusGateway, /replaceChildren/);
assert.match(chesedCommands, /export function createCommandButton/);
assert.match(chesedCommands, /export function durationPill/);
assert.match(chesedCommands, /addEventListener/);
assert.match(malchusRow, /export function renderTrackRow/);
for (const hodAction of ['play-row', 'playlist-track', 'download', 'cache', 'bookmark-track']) {
	assert.ok(malchusRow.includes(hodAction), `row action missing ${hodAction}`);
}
for (const hodAction of ['select-all-tracks', 'playlist-selected-tracks', 'playlist-event']) {
	assert.ok(tiferesToolbar.includes(`localSpec`) && tiferesToolbar.includes(hodAction), `local toolbar action missing ${hodAction}`);
}
for (const hodAction of ['download-event', 'cache-event', 'bookmark-folder']) {
	assert.ok(tiferesToolbar.includes(`controllerSpec`) && tiferesToolbar.includes(hodAction), `controller toolbar action missing ${hodAction}`);
}
assert.match(tiferesToolbar, /gevurahSingle \? 'Download' : 'ZIP'/);
for (const hodExport of ['selectionBox', 'selectAllVisible', 'openSelectedPlaylistPicker', 'updatePickedCount']) {
	assert.ok(yesodSelection.includes(`export function ${hodExport}`), `selection export missing ${hodExport}`);
}
assert.match(yesodSelection, /disabled = !yesodCount/);
assert.match(netzachCache, /classList\.toggle\('saved'/);
assert.match(netzachCache, /replaceChildren/);
for (const [hodName, hodSource] of Object.entries({ malchusGateway, chesedCommands, malchusRow, tiferesToolbar, yesodSelection, netzachCache })) {
	assert.ok(hodSource.trimEnd().split('\n').length <= 120, `${hodName} exceeds 120 lines`);
}
console.log('B"H rebbeTrackContract.test passed');
