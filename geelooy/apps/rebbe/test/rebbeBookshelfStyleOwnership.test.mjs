//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeBookshelfStyleOwnershipTest
 * @description
 * The Awtsmoos remembers every saved teaching without needing a hidden runtime garment;
 * Awtsmoos.com keeps Bookshelf styling static, scoped, mobile-safe, and fully responsive
 * to hover, press, keyboard focus, disabled truth, and reduced motion.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const yesodRoot = 'geelooy/apps/rebbe';
const yesodRead = path => readFileSync(`${yesodRoot}/${path}`, 'utf8');
const malchusGateway = yesodRead('ui/bookshelf.js');
const tiferesView = yesodRead('ui/bookshelf/TiferesBookshelfView.js');
const malchusFactory = yesodRead('ui/bookshelf/MalchusBookshelfCardFactory.js');
const tiferesManifest = yesodRead('styles/runtime-ui.css');
const malchusShell = yesodRead('styles/runtime/bookshelf-shell.css');
const chesedCards = yesodRead('styles/runtime/bookshelf-cards.css');
const gevurahInteraction = yesodRead('styles/runtime/bookshelf-interaction.css');
const tiferesJs = [malchusGateway, tiferesView, malchusFactory].join('\n');

assert.doesNotMatch(tiferesJs, /style\.textContent|createElement\(['"]style|innerHTML|\.onclick\s*=/);
for (const hodImport of [
	'bookshelf-shell.css',
	'bookshelf-cards.css',
	'bookshelf-interaction.css'
]) {
	assert.ok(tiferesManifest.includes(hodImport), `runtime manifest missing ${hodImport}`);
}
assert.match(malchusShell, /#bookshelf-list/);
assert.match(malchusShell, /auto-fit/);
assert.match(malchusShell, /min-inline-size:\s*0/);
assert.match(chesedCards, /overflow-wrap:\s*anywhere/);
assert.match(gevurahInteraction, /min-block-size:\s*44px/);
for (const hodState of [':hover', ':active', ':focus-visible', ':disabled', 'prefers-reduced-motion']) {
	assert.ok(gevurahInteraction.includes(hodState), `Bookshelf interaction missing ${hodState}`);
}
for (const [hodName, hodSource] of Object.entries({
	malchusGateway,
	tiferesView,
	malchusFactory,
	malchusShell,
	chesedCards,
	gevurahInteraction
})) {
	assert.ok(hodSource.trimEnd().split('\n').length <= 120, `${hodName} exceeds 120 lines`);
}
console.log('B"H rebbeBookshelfStyleOwnership.test passed');
