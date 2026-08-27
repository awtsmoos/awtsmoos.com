//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * @module CreatorCommandPaletteHygieneContract
 * @description
 * The Awtsmoos lets command power float without covering publication or leaving empty search as a broken shore;
 * Awtsmoos.com makes viewport clearance, combobox truth, no-results feedback, Escape, and focus restoration observable once more.
 */
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const read = relative => readFileSync(resolve(root, relative), 'utf8');

const layers = read('styles/creator/mobile-layers.css');
const responsive = read('styles/creator/command-palette-responsive.css');
const hygiene = read('styles/creator/future-hygiene-sheets.css');
const feedback = read('styles/creator/command-palette-feedback.css');
const manifest = read('styles/creator/command-palette.css');
const view = read('js/creator/CreatorCommandPaletteView.js');
const palette = read('js/creator/CreatorCommandPalette.js');
const sheet = read('../shared/ui/future/FutureSheet.js');

assert.match(layers, /--creator-publication-height/);
assert.match(layers, /creatorCommandLauncher/);
const narrow = responsive.split('@media (max-width: 24rem)')[1] || '';
assert.doesNotMatch(narrow, /(?:bottom|inset-block-end)\s*:/);
assert.match(hygiene, /\.creatorPalette/);
assert.doesNotMatch(hygiene, /\.creatorCommandDialog/);
assert.match(manifest, /command-palette-feedback\.css/);
assert.match(feedback, /\.creatorCommandEmpty/);
assert.match(view, /role', 'combobox'/);
assert.match(view, /aria-autocomplete', 'list'/);
assert.match(view, /aria-activedescendant/);
assert.match(view, /creatorCommandOption\$\{index\}/);
assert.match(view, /No creator tools match this search/);
assert.match(palette, /if \(!commands\.length\)/);
assert.match(palette, /event\.key === 'Escape'/);
assert.match(sheet, /addEventListener\('close', \(\) => this\.restoreFocus\(\)\)/);
assert.match(sheet, /this\.opener\.focus/);

console.log('creatorCommandPaletteHygieneContract.test.mjs passed');
