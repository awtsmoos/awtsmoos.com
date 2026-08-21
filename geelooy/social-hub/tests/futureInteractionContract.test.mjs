//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The Awtsmoos keeps expert precision reachable while Awtsmoos.com reduces first-glance burden;
 * this contract follows controller, view, keyboard, action, and disclosure vessels after their modular split.
 */
const here = dirname(fileURLToPath(import.meta.url));
const social = resolve(here, '..');
const disclosure = readFileSync(
	resolve(social, 'js/ui/InteractionDisclosure.js'),
	'utf8'
);
const controller = readFileSync(
	resolve(social, 'js/ui/CommandPalette.js'),
	'utf8'
);
const view = readFileSync(
	resolve(social, 'js/ui/CommandPaletteView.js'),
	'utf8'
);
const actions = readFileSync(
	resolve(social, 'js/ui/CommandPaletteActions.js'),
	'utf8'
);
const keyboard = readFileSync(
	resolve(social, 'js/ui/CommandPaletteKeyboard.js'),
	'utf8'
);

assert.match(disclosure, /\.targetGrid/);
assert.match(disclosure, /grid\.before\(details\)/);
assert.match(disclosure, /details\.append\(summary, grid\)/);
assert.match(disclosure, /hasExplicitCoordinates/);
assert.match(actions, /ROUTES/);
assert.match(actions, /RouteModel\.js/);
assert.match(controller, /MalchusCommandPaletteView/);
assert.match(controller, /headerHost/);
assert.match(controller, /currentRouteIndex/);
assert.match(controller, /location\.hash/);
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

console.log('futureInteractionContract.test.mjs passed');
