//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos gives portrait, landscape, keyboard, and touch distinct vessels beneath one living sky;
 * Awtsmoos.com verifies fixed viewport foundations, touch-safe world movement, compact encounters, and playable worlds nearby.
 */

import assert from "node:assert/strict";
import { readSevenSource } from "./test-source-reader.mjs";

const html = readSevenSource("index.html");
const shell = readSevenSource("styles/viewport-shell/base.css");
const gameShell = readSevenSource("styles/game-shell-3d.css");
const worldMobile = readSevenSource("styles/mobile-controls.css");
const gameMobile = readSevenSource("styles/mobile-game.css");
const landscape = readSevenSource("styles/mobile-landscape.css");
const motion = readSevenSource("styles/reduced-motion.css");
const rescue = readSevenSource("js/games3d/every-life-game.js");
const words = readSevenSource("js/games3d/words-creation-game.js");
const households = readSevenSource("js/games3d/households-game.js");

assert.match(html, /name="viewport"/);
assert.match(html, /viewport-fit=cover/);
assert.match(html, /id="sevenMitzvosApp"/);
assert.match(shell, /height:\s*100dvh/);
assert.match(shell, /overflow:\s*hidden/);
assert.match(shell, /overscroll-behavior:\s*none/);
assert.match(gameShell, /touch-action:\s*none/);
assert.match(worldMobile, /repeat\(3,\s*48px\)/);
assert.match(worldMobile, /repeat\(2,\s*48px\)/);
assert.match(worldMobile, /min-height:\s*48px/);
assert.match(worldMobile, /min-width:\s*48px/);
assert.match(worldMobile, /max-width:\s*760px/);
assert.match(gameMobile, /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
assert.match(gameMobile, /min-height:\s*48px/);
assert.match(landscape, /max-height:\s*540px/);
assert.match(landscape, /orientation:\s*landscape/);
assert.match(motion, /prefers-reduced-motion:\s*reduce/);
assert.match(rescue, /ArrowUp/);
assert.match(rescue, /this\.controls/);
assert.match(words, /RunePillarView/);
assert.match(households, /Protect \$\{index \+ 1\}/);
console.log('B"H · Living viewport, world touch, encounter touch, keyboard, landscape, and motion contracts verified.');
