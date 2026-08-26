//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeSearchSafeDomContractTest
 * @description
 * The Awtsmoos gives archive words no need to become executable markup; Awtsmoos.com protects result data, historic callback vocabulary, and context-menu geometry through safe DOM and viewport clamping.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const yesodRoot = 'geelooy/apps/rebbe';
const yesodRead = path => readFileSync(`${yesodRoot}/${path}`, 'utf8');
const malchusDom = yesodRead('ui/browser/search/SearchResultDom.js');
const tiferesTrack = yesodRead('ui/browser/search/SearchTrackRow.js');
const tiferesEvent = yesodRead('ui/browser/search/SearchEventCard.js');
const yesodView = yesodRead('ui/browser/search/SearchResultsView.js');
const gevurahModal = yesodRead('ui/modals.js');
const tiferesCombined = [malchusDom, tiferesTrack, tiferesEvent, yesodView].join('\n');

assert.match(malchusDom, /textContent/);
assert.doesNotMatch(tiferesCombined, /innerHTML|insertAdjacentHTML|style\.textContent/);
for (const hodCallback of [
	'onPlayTrack',
	'onAddToPlaylist',
	'onCacheTrack',
	'onDownloadTrack',
	'onBookmarkTrack',
	'onPlayEvent',
	'onOpen',
	'onAddEventToPlaylist',
	'onCacheEvent',
	'onDownloadEvent',
	'onBookmark',
	'onLoadTracks'
]) {
	assert.ok(tiferesCombined.includes(hodCallback), `search renderer missing ${hodCallback}`);
}
assert.match(gevurahModal, /window\.innerWidth/);
assert.match(gevurahModal, /window\.innerHeight/);
assert.match(gevurahModal, /Math\.min\(Math\.max/);
assert.match(gevurahModal, /requestAnimationFrame/);
assert.doesNotMatch(gevurahModal, /innerHTML/);
console.log('B"H rebbeSearchSafeDomContract.test passed');
