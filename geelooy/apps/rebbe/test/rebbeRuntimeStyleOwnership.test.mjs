//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeRuntimeStyleOwnershipTest
 * @description
 * The Awtsmoos needs no hidden runtime string to clothe a visible interface;
 * Awtsmoos.com keeps late-born garments static while mobile Studio controls
 * stay inside the first touchable viewport, where ordered light remains bright.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const yesodRoot = 'geelooy/apps/Rebbe';
const yesodRead = path => readFileSync(`${yesodRoot}/${path}`, 'utf8');
const malchusCore = yesodRead('styles/core.css');
const yesodPremium = yesodRead('styles/rebbe-premium.css');
const tiferesRuntime = yesodRead('styles/runtime-ui.css');
const malchusPlaylistStyle = yesodRead('ui/playlists/styles.js');
const netzachTasks = yesodRead('modules/download/tasks.js');
const hodCard = yesodRead('modules/download/DownloadTaskCard.js');
const gevurahDownloadCss = yesodRead('styles/runtime/download-tasks.css');
const tiferesInteraction = yesodRead('styles/runtime/download-task-interaction.css');
const tiferesStudioPolish = yesodRead('styles/runtime/studio-polish.css');

assert.match(malchusCore, /runtime-ui\.css/);
assert.match(yesodPremium, /rebbe-premium-surfaces\.css/);
for (const hodImport of [
	'download-tasks.css',
	'download-task-interaction.css',
	'playlists-shell.css',
	'playlists-cards.css',
	'playlists-controls.css',
	'playlists-fields.css',
	'playlists-tracks.css',
	'playlists-selection.css',
	'studio-polish.css'
]) {
	assert.ok(tiferesRuntime.includes(hodImport), `runtime manifest missing ${hodImport}`);
}

assert.doesNotMatch(malchusPlaylistStyle, /style\.textContent|createElement\(['"]style/);
assert.doesNotMatch(netzachTasks, /style\.textContent|createElement\(['"]style|innerHTML/);
assert.doesNotMatch(hodCard, /innerHTML/);
assert.match(hodCard, /textContent/);
assert.match(gevurahDownloadCss, /inline-size:\s*44px/);
assert.match(gevurahDownloadCss, /block-size:\s*44px/);
for (const hodState of [':hover', ':active', ':focus-visible', 'prefers-reduced-motion']) {
	assert.ok(tiferesInteraction.includes(hodState), `download interaction missing ${hodState}`);
}

for (const [malchusSelector, gevurahOrder] of [
	['#btn-toggle-props', '-50'],
	['#st-play', '-49'],
	['#st-stop', '-48'],
	['#btn-close-studio', '-47'],
	['#btn-minimize', '-46']
]) {
	assert.ok(tiferesStudioPolish.includes(malchusSelector), `Studio polish missing ${malchusSelector}`);
	assert.match(tiferesStudioPolish, new RegExp(`order:\\s*${gevurahOrder}`));
}
assert.match(tiferesStudioPolish, /min-height:\s*44px/);
assert.match(tiferesStudioPolish, /safe-area-inset-left/);
assert.match(tiferesStudioPolish, /safe-area-inset-right/);
assert.ok(tiferesStudioPolish.trimEnd().split('\n').length <= 120);

console.log('B"H rebbeRuntimeStyleOwnership.test passed');
