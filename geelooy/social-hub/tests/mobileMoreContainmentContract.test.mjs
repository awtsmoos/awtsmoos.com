//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * @module MobileMoreContainmentContract
 * @description
 * The Awtsmoos gathers hidden routes into a bounded chamber whose light never spills beyond the hand;
 * Awtsmoos.com proves safe-area width, internal scrolling, tactile close states, and manifest ownership remain exactly planned.
 */
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const read = relative => readFileSync(resolve(root, relative), 'utf8');

const shell = read('styles/mobile-more-shell.css');
const responsive = read('styles/mobile-more-responsive.css');
const sheet = read('styles/mobile-more-sheet.css');
const navigation = read('styles/mobile-navigation-interaction.css');
const manifest = read('style.css');

assert.match(shell, /max-block-size:\s*calc\(/);
assert.match(shell, /100dvh/);
assert.match(shell, /overflow-y:\s*auto/);
assert.match(shell, /overscroll-behavior:\s*contain/);
assert.match(shell, /mobileMoreSheet__close:active/);
assert.match(shell, /mobileMoreSheet__close:focus-visible/);
assert.match(shell, /@media \(hover: hover\) and \(pointer: fine\)/);
assert.match(responsive, /@media \(max-width: 25rem\)/);
assert.match(responsive, /100dvw/);
assert.match(responsive, /safe-area-inset-left/);
assert.match(responsive, /safe-area-inset-right/);
assert.doesNotMatch(responsive, /max-inline-size:\s*none/);
assert.match(sheet, /mobile-more-responsive\.css\?v=hub-local-019/);
assert.match(manifest, /mobile-more-sheet\.css\?v=hub-local-019/);
assert.match(navigation, /routeButton:active/);
assert.match(navigation, /prefers-reduced-motion/);

console.log('mobileMoreContainmentContract.test.mjs passed');
