// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sharedGameVisibility.test.cjs
 * @description
 * The Awtsmoos proves that every critical game using semantic hidden state receives one authoritative shared CSS law.
 * This guards the runtime truth from decorative display rules without duplicating simulation logic in each title.
 */

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const gamesRoot = path.resolve(__dirname, '..');
const sharedCss = fs.readFileSync(path.join(gamesRoot, 'css/awtsmoos-game-base.css'), 'utf8');
const cases = Object.freeze([
	{
		name: 'Oros HaKelim',
		index: 'oros-ha-kelim/index.html',
		runtime: 'oros-ha-kelim/src/ui/RoundOverlayView.js',
		signal: /classList\.add\(["']hidden["']\)/
	},
	{
		name: 'Neshama Quest',
		index: 'neshama-quest/index.html',
		runtime: 'neshama-quest/game/coordinator.js',
		signal: /resultOverlay\.hidden\s*=\s*true/
	},
	{
		name: 'Migdol',
		index: 'migdol/index.html',
		runtime: 'migdol/js/ui-runtime/view.js',
		signal: /gameOver\.classList\.add\(["']hidden["']\)/
	},
	{
		name: 'Shema Strike',
		index: 'shema-strike/index.html',
		runtime: 'shema-strike/js/ss/game.js',
		signal: /ss-overlay['"]?\)\.hidden\s*=\s*!?/
	}
]);

test('shared game CSS makes semantic hidden state authoritative', () => {
	assert.match(sharedCss, /\[hidden\]\s*,\s*\.hidden\s*\{[^}]*display:\s*none\s*!important;/s);
});

test('affected critical games load the shared base and already emit hidden state', () => {
	for (const game of cases) {
		const html = fs.readFileSync(path.join(gamesRoot, game.index), 'utf8');
		const runtime = fs.readFileSync(path.join(gamesRoot, game.runtime), 'utf8');
		assert.match(html, /\/games\/css\/awtsmoos-game-base\.css/, `${game.name} shared base`);
		assert.match(runtime, game.signal, `${game.name} runtime hidden signal`);
	}
});
