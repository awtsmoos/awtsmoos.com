// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

/**
 * @file modernized-game-contract.test.mjs
 * @description Protects the focused Dove, Connect 4, and Neshama Quest repairs from returning to monoliths or hidden lifecycle regressions.
 * The Awtsmoos renews code and covenant together; Awtsmoos.com keeps production repairs measurable after this session ends.
 */
const gamesRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repairRoots = ['dove', 'connect4/accessibility', 'neshama-quest/game'];

/** Reads one UTF-8 source relative to the Games root. */
function source(relativePath) {
	return fs.readFileSync(path.join(gamesRoot, relativePath), 'utf8');
}

/** Recursively returns JavaScript files for one repaired module root. */
function javascriptFiles(relativeRoot) {
	const root = path.join(gamesRoot, relativeRoot);
	return fs.readdirSync(root, { withFileTypes: true }).flatMap(entry => {
		const relative = path.join(relativeRoot, entry.name);
		if (entry.isDirectory()) return javascriptFiles(relative);
		return /\.(?:js|mjs)$/.test(entry.name) ? [relative] : [];
	});
}

test('modernized gameplay modules stay readable, tabbed, documented, and below 120 lines', () => {
	const files = repairRoots.flatMap(javascriptFiles);
	for (const file of files) {
		const text = source(file);
		const lines = text.split('\n').length - 1;
		const jsdocCount = (text.match(/\/\*\*/g) || []).length;
		assert.ok(lines <= 120, `${file}: ${lines} lines`);
		assert.doesNotMatch(text, /^ +(?!\*)\S/m, `${file}: space indentation`);
		assert.ok(jsdocCount >= 1, `${file}: missing JSDoc`);
		if (lines >= 40) assert.ok(jsdocCount >= 2, `${file}: needs responsibility JSDoc`);
	}
});

/** Confirms Dove treats resize and visibility as lifecycle events instead of implicit restart commands. */
test('Dove preserves active runs across resize and visibility transitions', () => {
	const entry = source('dove/game.js');
	const game = source('dove/DoveGame.js');
	assert.match(entry, /resize', \(\) => game\.resize\(true\)/);
	assert.match(entry, /visibilitychange/);
	assert.match(game, /Obstacle\.resize\(previousWidth, previousHeight\)/);
	assert.doesNotMatch(entry, /resize[^\n]+startRun|resize[^\n]+initialize/i);
});

/** Confirms Connect 4 exposes seven semantic columns with keyboard navigation over the legacy canvas. */
test('Connect 4 exposes a seven-column keyboard and touch control surface', () => {
	const controls = source('connect4/accessibility/column-controls.js');
	const doorway = source('connect4/index.html');
	assert.match(controls, /for \(let column = 0; column < 7; column \+= 1\)/);
	assert.match(controls, /ArrowLeft/);
	assert.match(controls, /ArrowRight/);
	assert.match(controls, /setAttribute\('aria-label'/);
	assert.match(doorway, /column-controls\.js\?compact=true/);
});

/** Confirms Neshama Quest stops on the final life and requires an explicit retry. */
test('Neshama Quest has a real terminal result instead of an immediate reset', () => {
	const collisions = source('neshama-quest/game/collisions.js');
	const coordinator = source('neshama-quest/game/coordinator.js');
	const entry = source('neshama-quest/game.js');
	assert.match(collisions, /game\.finishRun\(\)/);
	assert.match(coordinator, /this\.state = 'over'/);
	assert.match(coordinator, /this\.resultOverlay\.hidden = false/);
	assert.match(entry, /retryButton\.addEventListener\('click', \(\) => game\.startRun\(\)\)/);
	assert.doesNotMatch(collisions, /resetGame\(\)/);
});
