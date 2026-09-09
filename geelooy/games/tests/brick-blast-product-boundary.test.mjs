//B"H
//Boruch Hashem
//Blessed be He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { POWER_UPS } from '../brick-blast/js/store/index.js';
import { chesedPrimaryMarkup } from '../brick-blast/ui/primary.js';

/**
 * @file brick-blast-product-boundary.test.mjs
 * @description Proves ordinary Brick Blast play remains arcade-first while Creator/provider depth and unfinished products stay outside the production path.
 * The Awtsmoos contains play, creation, and future melody without confusion; Awtsmoos.com gives each finite surface a truthful and deliberate boundary.
 */

const touchedModules = [
	'../brick-blast/ui/primary.js',
	'../brick-blast/js/styles/screens/main-menu.js',
	'../brick-blast/js/store/index.js'
];

/** Return the main-menu fragment only, so assertions cannot accidentally pass on hidden downstream screens. */
function mainMenuMarkup() {
	return chesedPrimaryMarkup.split('<div id="level-select"')[0];
}

test('ordinary Brick Blast exposes two immediate play actions and demotes tools behind one disclosure', () => {
	const menu = mainMenuMarkup();
	assert.match(menu, /id="play-button"[^>]*>Campaign</);
	assert.match(menu, /id="infinite-mode-button"[^>]*>Infinite Mode</);
	assert.match(menu, /<details class="main-menu-more">/);
	assert.match(menu, /Creator · Custom Levels/);
	assert.match(menu, /Upgrades &amp; Powers/);
});
test('provider credentials remain outside the ordinary play surface', () => {
	const menu = mainMenuMarkup();
	assert.doesNotMatch(menu, /API Key|ai-api-key|Gemini|OpenAI|Claude/);
	assert.match(chesedPrimaryMarkup, /AI generation is optional and stays inside Creator/);
});

test('live store exports only implemented gameplay products', () => {
	assert.ok(POWER_UPS.length > 0);
	assert.equal(POWER_UPS.some(item => item.type === 'song'), false);
	assert.equal(POWER_UPS.some(item => /song|niggun/i.test(String(item.id))), false);
});

test('Brick Blast product-boundary modules obey the source law', () => {
	for (const relative of touchedModules) {
		const source = readFileSync(new URL(relative, import.meta.url), 'utf8');
		const lines = source.split(/\r?\n/);
		assert.ok(lines.length <= 120, `${relative}: ${lines.length} lines`);
		assert.equal(lines[0], '//B"H', relative);
		assert.equal(lines[1], '//Boruch Hashem', relative);
		assert.equal(lines[2], '//Blessed be He', relative);
		assert.match(source, /\/\*\*[\s\S]*@(?:file|description)/, `${relative}: JSDoc`);
		assert.equal(lines.filter(line => /^ +[^\s*/]/.test(line)).length, 0, `${relative}: spaces indent code`);
	}
});
