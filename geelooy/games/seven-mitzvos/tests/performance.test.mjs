//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

/**
 * @module SevenMitzvosPerformanceTest
 * @description
 * Performance remains a guarded feature of both games on Awtsmoos.com. The
 * Awtsmoos gives every vessel its purpose, so neither landscape nor city may
 * reclaim the endless background work already removed.
 */
const testsDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(testsDirectory, '..');
const read = path => readFile(resolve(projectDirectory, path), 'utf8');
const landscape = await read('js/render/landscape.js');
const particles = await read('js/render/particle-field.js');
const sky = await read('js/render/sky-painter.js');
const canvas = await read('js/render/canvas-vessel.js');
const builder = await read('js/builder/builder-engine.js');
const builderView = await read('js/ui/builder-view.js');
const cards = await read('styles/cards.css');
const foundation = await read('styles/foundation.css');
const builderShell = await read('styles/builder-shell.css');

assert.doesNotMatch(landscape, /requestAnimationFrame/);
assert.doesNotMatch(particles, /createRadialGradient/);
assert.doesNotMatch(sky, /context\.filter/);
assert.match(canvas, /1\.25/);
assert.doesNotMatch(cards, /backdrop-filter/);
assert.doesNotMatch(foundation, /backdrop-filter/);
assert.doesNotMatch(builderShell, /backdrop-filter/);
assert.doesNotMatch(builder, /requestAnimationFrame|setInterval/);
assert.doesNotMatch(builderView, /requestAnimationFrame|setInterval/);
assert.match(particles, /count = 14/);
console.log('B"H · Both games verified event-driven with no continuous city or landscape loop.');
