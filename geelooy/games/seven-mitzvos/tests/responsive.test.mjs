//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

/**
 * @module SevenWorldsResponsiveTest
 * @description
 * Desktop and mobile controls remain explicit contracts on Awtsmoos.com. The
 * Awtsmoos gives every player a different vessel; styles and game adapters must
 * preserve touch size, stacking, keyboard access, and reduced motion.
 */
const testsDirectory = dirname(fileURLToPath(import.meta.url));
const root = resolve(testsDirectory, '..');
const read = path => readFile(resolve(root, path), 'utf8');
const html = await read('index.html');
const hero = await read('styles/hero-seven.css');
const shell = await read('styles/universe-shell.css');
const toolbar = await read('styles/universe-toolbar.css');
const cards = await read('styles/universe-cards.css');
const portal = await read('styles/universe-portal.css');
const controls = await read('styles/world-controls.css');
const direction = await read('styles/world-direction.css');
const grids = await read('styles/world-grid.css');
const simulations = await read('styles/world-sim.css');
const market = await read('styles/world-market.css');
const court = await read('styles/world-court.css');
const motion = await read('styles/world-motion.css');
const rescue = await read('js/world-games/every-life/game.js');
const words = await read('js/world-games/words-of-creation/game.js');
const households = await read('js/world-games/households/game.js');

assert.match(html, /name="viewport"/);
assert.match(html, /id="universeMount"/);
assert.match(html, /class="heroMitzvahStrip"/);
assert.match(hero, /@media \(max-width: 480px\)/);
assert.match(shell + toolbar, /@media \(max-width: 760px\)/);
assert.match(cards, /grid-template-columns: repeat\(4/);
assert.match(cards, /grid-template-columns: repeat\(2/);
assert.match(cards, /grid-template-columns: 1fr/);
assert.match(portal, /@media \(max-width: 680px\)/);
assert.match(controls, /min-height: 46px/);
assert.match(direction, /min-width: 56px/);
assert.match(direction, /min-height: 56px/);
assert.match(grids, /@media \(max-width: 760px\)/);
assert.match(simulations, /@media \(max-width: 800px\)/);
assert.match(market, /@media \(max-width: 520px\)/);
assert.match(court, /@media \(max-width: 720px\)/);
assert.match(motion + controls, /prefers-reduced-motion/);
assert.match(rescue, /ArrowUp/);
assert.match(rescue, /directionPad/);
assert.match(words, /LETTER_PADS/);
assert.match(households, /\['1', '2', '3'\]/);
console.log('B"H · Desktop grids, mobile stacking, touch targets, D-pad, keyboard, and reduced motion verified.');
