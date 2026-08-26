//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeRuntimeLayerContractTest
 * @description
 * The Awtsmoos is beyond height and overlap while Awtsmoos.com gives player, selection, and download vessels one measured order; this contract prevents old five-digit z-index warfare from returning beneath a polished surface.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const yesodRoot = 'geelooy/apps/rebbe';
const yesodRead = path => readFileSync(`${yesodRoot}/${path}`, 'utf8');
const malchusCore = yesodRead('styles/core.css');
const tiferesResponsive = yesodRead('styles/rebbe-premium-responsive.css');
const netzachDownload = yesodRead('styles/runtime/download-task-interaction.css');
const hodDownload = yesodRead('styles/runtime/download-tasks.css');
const yesodSelection = yesodRead('styles/runtime/playlists-selection.css');
const tiferesCombined = [malchusCore, tiferesResponsive, netzachDownload, hodDownload, yesodSelection].join('\n');

for (const hodToken of [
	'--rebbe-layer-player',
	'--rebbe-layer-popover',
	'--rebbe-layer-floating',
	'--rebbe-player-mobile-clearance',
	'--rebbe-selection-clearance'
]) {
	assert.ok(malchusCore.includes(hodToken), `core layer law missing ${hodToken}`);
}

assert.match(tiferesResponsive, /z-index:\s*var\(--rebbe-layer-player\)/);
assert.match(yesodSelection, /z-index:\s*var\(--rebbe-layer-popover\)/);
assert.match(hodDownload, /z-index:\s*var\(--rebbe-layer-floating\)/);
assert.match(yesodSelection, /var\(--rebbe-player-mobile-clearance\)/);
assert.match(netzachDownload, /var\(--rebbe-player-mobile-clearance\)/);
assert.match(netzachDownload, /var\(--rebbe-selection-clearance\)/);
assert.match(hodDownload, /body\.has-playlist-selection/);
assert.doesNotMatch(tiferesCombined, /10030|10050/);

for (const [hodName, hodSource] of Object.entries({ malchusCore, tiferesResponsive, netzachDownload, hodDownload, yesodSelection })) {
	const yesodLines = hodSource.trimEnd().split('\n').length;
	assert.ok(yesodLines <= 120, `${hodName} exceeds 120 lines`);
}
console.log('B"H rebbeRuntimeLayerContract.test passed');
