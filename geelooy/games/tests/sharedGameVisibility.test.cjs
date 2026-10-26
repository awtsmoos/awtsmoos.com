// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sharedGameVisibility.test.cjs
 * @description
 * The Awtsmoos proves each critical game loads a last-mile visibility vessel after decorative CSS,
 * while runtime code continues to own semantic hidden state instead of simulation-specific workarounds.
 */

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const gamesRoot = path.resolve(__dirname, '..');
const cases = Object.freeze([
	{
		name: 'Migdol',
		index: 'migdol/index.html',
		visibility: 'migdol/styles/visibility.css',
		runtime: 'migdol/js/ui-runtime/view.js',
		selector: /#game-over-screen\.hidden[\s\S]*display:\s*none\s*!important/,
		signal: /gameOver\.classList\.add\(["']hidden["']\)/
	},
	{
		name: 'Neshama Quest',
		index: 'neshama-quest/index.html',
		visibility: 'neshama-quest/visibility.css',
		runtime: 'neshama-quest/game/coordinator.js',
		selector: /\.resultOverlay\[hidden\][\s\S]*display:\s*none\s*!important/,
		signal: /resultOverlay\.hidden\s*=\s*true/
	},
	{
		name: 'Shema Strike',
		index: 'shema-strike/index.html',
		visibility: 'shema-strike/css/visibility.css',
		runtime: 'shema-strike/js/ss/game.js',
		selector: /#ss-overlay\[hidden\][\s\S]*display:\s*none\s*!important/,
		signal: /overlay\.hidden\s*=\s*!paused|ss-overlay/
	},
	{
		name: 'Oros HaKelim',
		index: 'oros-ha-kelim/index.html',
		visibility: 'oros-ha-kelim/styles/visibility.css',
		runtime: 'oros-ha-kelim/src/ui/RoundOverlayView.js',
		selector: /\.oros-app \.overlay\.hidden[\s\S]*display:\s*none\s*!important/,
		signal: /classList\.add\(["']hidden["']\)/
	}
]);

function text(relative) {
	return fs.readFileSync(path.join(gamesRoot, relative), 'utf8');
}

test('each critical game owns an authoritative terminal visibility rule', () => {
	for (const game of cases) {
		assert.match(text(game.visibility), game.selector, `${game.name} visibility selector`);
	}
});

test('each visibility vessel loads last and runtime still emits hidden state', () => {
	for (const game of cases) {
		const html = text(game.index);
		const href = game.visibility.split('/').slice(1).join('/');
		assert(html.indexOf(href) > html.indexOf('awtsmoos-game-base.css'), `${game.name} visibility order`);
		assert.match(text(game.runtime), game.signal, `${game.name} runtime hidden signal`);
	}
});
