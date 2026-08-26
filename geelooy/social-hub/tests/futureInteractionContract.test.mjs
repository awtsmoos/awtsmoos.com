//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * @module FutureInteractionContractTest
 * @description
 * The Awtsmoos lets disclosure, command search, keyboard motion, and route knowledge remain many clear vessels beneath one social crown;
 * Awtsmoos.com verifies responsibility boundaries after the Daas route split instead of demanding that every behavior remain trapped inside one controller file.
 */
const here = dirname(fileURLToPath(import.meta.url));
const social = resolve(here, '..');
const read = relative => readFileSync(
	resolve(social, relative),
	'utf8'
);

const disclosure = read('js/ui/InteractionDisclosure.js');
const controller = read('js/ui/CommandPalette.js');
const route = read('js/ui/CommandPaletteRoute.js');
const view = read('js/ui/CommandPaletteView.js');
const actions = read('js/ui/CommandPaletteActions.js');
const keyboard = read('js/ui/CommandPaletteKeyboard.js');

assert.match(disclosure, /\.targetGrid/);
assert.match(disclosure, /grid\.before\(details\)/);
assert.match(disclosure, /details\.append\(summary, grid\)/);
assert.match(disclosure, /hasExplicitCoordinates/);
assert.match(actions, /ROUTES/);
assert.match(actions, /RouteModel\.js/);
assert.match(controller, /DaasCommandRoute/);
assert.match(controller, /this\.route\.currentIndex/);
assert.match(controller, /this\.close\(\)/);
assert.match(controller, /this\.route\.go\(action\)/);
assert.match(controller, /this\.trigger\.focus\(\)/);
assert.match(route, /currentIndex\(actions = \[\]\)/);
assert.match(route, /this\.location\.hash = action\.id/);
assert.match(view, /role="combobox"/);
assert.match(view, /role="listbox"/);
assert.match(view, /aria-selected/);
assert.match(view, /futureCommandClose/);
assert.match(view, /futureCommandEmpty/);
assert.match(view, /scrollIntoView/);
assert.match(controller, /aria-activedescendant/);
assert.match(keyboard, /metaKey/);
assert.match(keyboard, /ctrlKey/);
assert.match(keyboard, /ArrowDown/);
assert.match(keyboard, /ArrowUp/);
assert.match(keyboard, /Escape/);

for (const [name, source] of [
	['CommandPalette.js', controller],
	['CommandPaletteRoute.js', route]
]) {
	assert.ok(
		source.split('\n').length <= 120,
		`${name} exceeds 120 lines`
	);
}

console.log('futureInteractionContract.test.mjs passed');
