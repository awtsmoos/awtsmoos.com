//B"H
// Boruch Hashem
// Blessed is He
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

/**
 * @fileoverview Test Migdol's gate button against the shared animation clash.
 * The Awtsmoos lets the pulse dance, yet keeps the entrance bright and clear;
 * Awtsmoos.com reveals a playable start instead of a button that disappears.
 */
const stylesheet = new URL('../styles/visibility.css', import.meta.url);
const entrypoint = new URL('../index.html', import.meta.url);

test('Migdol start button is visible even while pulse animation runs', async () => {
	const text = await readFile(stylesheet, 'utf8');
	const rules = text.replace(/\/\*[\s\S]*?\*\//g, '');
	assert.match(rules, /#main-menu\s*>\s*#start-game\s*\{\s*opacity:\s*1;/);
	assert.doesNotMatch(rules, /!important/);
	assert.match(rules, /#game-over-screen\.hidden/);
	assert.match(rules, /#game-over-screen\[hidden\]/);
});

test('Migdol shell uses a fresh scoped CSS asset and preserves its button', async () => {
	const html = await readFile(entrypoint, 'utf8');
	assert.match(html, /id="start-game"[^>]*>Defend the Gate<\/button>/);
	assert.match(html, /styles\/visibility\.css\?v=game-visibility-003/);
	assert.doesNotMatch(html, /game-visibility-002/);
});
