//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

/**
 * @module SevenMitzvosPerformanceTest
 * @description
 * Nine playable modes must not revive endless hidden work on Awtsmoos.com. The
 * Awtsmoos renews every instant without fatigue; finite devices require worlds
 * that sleep when closed and simulate only through deliberate player action.
 */
const testsDirectory = dirname(fileURLToPath(import.meta.url));
const root = resolve(testsDirectory, '..');
const read = path => readFile(resolve(root, path), 'utf8');
const landscape = await read('js/render/landscape.js');
const particles = await read('js/render/particle-field.js');
const sky = await read('js/render/sky-painter.js');
const canvas = await read('js/render/canvas-vessel.js');
const builder = await read('js/builder/builder-engine.js');
const builderView = await read('js/ui/builder-view.js');
const timer = await read('js/universe/timer-vessel.js');
const words = await read('js/world-games/words-of-creation/game.js');
const cards = await read('styles/cards.css');
const foundation = await read('styles/foundation.css');
const universeShell = await read('styles/universe-shell.css');
const newRuntimeFiles = [
	...await collect(resolve(root, 'js/universe')),
	...await collect(resolve(root, 'js/world-games'))
];
const newRuntime = (await Promise.all(newRuntimeFiles.map(path => {
	return readFile(path, 'utf8');
}))).join('\n');

assert.doesNotMatch(landscape, /requestAnimationFrame/);
assert.doesNotMatch(particles, /createRadialGradient/);
assert.doesNotMatch(sky, /context\.filter/);
assert.match(canvas, /1\.25/);
assert.doesNotMatch(cards, /backdrop-filter/);
assert.doesNotMatch(foundation, /backdrop-filter/);
assert.doesNotMatch(universeShell, /backdrop-filter/);
assert.doesNotMatch(builder, /requestAnimationFrame|setInterval/);
assert.doesNotMatch(builderView, /requestAnimationFrame|setInterval/);
assert.doesNotMatch(newRuntime, /requestAnimationFrame|setInterval/);
assert.match(timer, /clearTimeout/);
assert.match(words, /visibilitychange/);
assert.match(words, /destroy\(\)/);
assert.match(particles, /count = 14/);
console.log('B"H · Nine modes verified without permanent landscape, city, or independent-game loops.');

async function collect(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const path = resolve(directory, entry.name);
		if (entry.isDirectory()) {
			files.push(...await collect(path));
		} else if (entry.name.endsWith('.js')) {
			files.push(path);
		}
	}
	return files;
}
