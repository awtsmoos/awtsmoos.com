//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * @module SevenWorldsResponsiveTest
 * @description
 * Portrait, landscape, keyboard, and touch now belong to one fixed Awtsmoos.com
 * experience. The Awtsmoos gives every player a different vessel; these contracts
 * preserve seven visible titles, thumb controls, reduced motion, and zero page flow.
 */
const testsDirectory = dirname(fileURLToPath(import.meta.url));
const root = resolve(testsDirectory, '..');
const read = path => readFile(resolve(root, path), 'utf8');
const html = await read('index.html');
const shell = await read('styles/viewport-shell.css');
const grid = await read('styles/mitzvah-grid-3d.css');
const gameShell = await read('styles/game-shell-3d.css');
const mobile = await read('styles/mobile-controls.css');
const mobileGame = await read('styles/mobile-game.css');
const landscape = await read('styles/mobile-landscape.css');
const motion = await read('styles/reduced-motion.css');
const rescue = await read('js/games3d/every-life-game.js');
const words = await read('js/games3d/words-creation-game.js');
const households = await read('js/games3d/households-game.js');

assert.match(html, /name="viewport"/);
assert.match(html, /viewport-fit=cover/);
assert.match(html, /id="sevenMitzvosApp"/);
assert.match(shell, /height:\s*100dvh/);
assert.match(shell, /overflow:\s*hidden/);
assert.match(shell, /overscroll-behavior:\s*none/);
assert.match(grid, /repeat\(4, minmax\(0, 1fr\)\)/);
assert.match(grid, /repeat\(2, minmax\(0, 1fr\)\)/);
assert.match(gameShell, /touch-action:\s*none/);
assert.match(mobile, /max-width: 700px/);
assert.match(mobile, /repeat\(2, minmax\(0, 1fr\)\)/);
assert.match(mobile, /repeat\(4, minmax\(0, 1fr\)\)/);
assert.match(landscape, /max-height: 540px/);
assert.match(landscape, /orientation: landscape/);
assert.match(mobileGame, /grid-template-columns: repeat\(4/);
assert.match(motion, /prefers-reduced-motion: reduce/);
assert.match(rescue, /ArrowUp/);
assert.match(rescue, /this\.controls/);
assert.match(words, /RunePillarView/);
assert.match(households, /Protect \$\{index \+ 1\}/);
console.log('B"H · Fixed portrait, landscape, touch, keyboard, and reduced-motion contracts verified.');
