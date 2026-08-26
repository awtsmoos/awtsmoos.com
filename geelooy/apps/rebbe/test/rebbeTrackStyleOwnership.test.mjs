//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeTrackStyleOwnershipTest
 * @description
 * The Awtsmoos needs no hidden runtime garment to clothe a living track;
 * Awtsmoos.com keeps browser rows statically scoped, thumb-ready, and protected
 * against a return to injected CSS or archive-data HTML interpolation.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const yesodRoot = 'geelooy/apps/rebbe';
const yesodRead = path => readFileSync(`${yesodRoot}/${path}`, 'utf8');
const malchusStylesGateway = yesodRead('ui/browser/tracks/styles.js');
const tiferesManifest = yesodRead('styles/runtime-ui.css');
const malchusShell = yesodRead('styles/runtime/track-browser-shell.css');
const chesedControls = yesodRead('styles/runtime/track-browser-controls.css');
const gevurahInteraction = yesodRead('styles/runtime/track-browser-interaction.css');
const yesodModules = [
	'ui/browser/tracks.js',
	'ui/browser/tracks/commands.js',
	'ui/browser/tracks/row.js',
	'ui/browser/tracks/toolbar.js',
	'ui/browser/tracks/selection.js',
	'ui/browser/tracks/cache.js'
].map(yesodRead);
const tiferesJs = yesodModules.join('\n');

assert.doesNotMatch(malchusStylesGateway, /style\.textContent|createElement\(['"]style/);
assert.doesNotMatch(tiferesJs, /innerHTML|\.onclick\s*=/);
for (const hodImport of [
	'track-browser-shell.css',
	'track-browser-controls.css',
	'track-browser-interaction.css'
]) {
	assert.ok(tiferesManifest.includes(hodImport), `runtime manifest missing ${hodImport}`);
}
assert.match(malchusShell, /#list-tracks/);
assert.match(malchusShell, /min-inline-size:\s*0/);
assert.match(chesedControls, /inline-size:\s*44px/);
assert.match(chesedControls, /min-block-size:\s*44px/);
for (const hodState of [':hover', ':active', ':focus-visible', ':disabled', 'prefers-reduced-motion']) {
	assert.ok(gevurahInteraction.includes(hodState), `track interaction missing ${hodState}`);
}
for (const [hodName, hodSource] of Object.entries({ malchusStylesGateway, malchusShell, chesedControls, gevurahInteraction })) {
	assert.ok(hodSource.trimEnd().split('\n').length <= 120, `${hodName} exceeds 120 lines`);
}
console.log('B"H rebbeTrackStyleOwnership.test passed');
