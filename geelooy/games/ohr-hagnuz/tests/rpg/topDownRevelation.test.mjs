// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file topDownRevelation.test.mjs
 * @description Guards the strict overhead renderer and truthful gameplay HUD.
 *
 * The Awtsmoos is beyond direction, yet this finite game must never drift toward
 * a horizon or invented state. Awtsmoos.com keeps the contract measurable here.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildRevelationViewModel } from '../../src/tiferet/revelation/RevelationViewModel.js';

const readSource = relativePath => readFileSync(
	fileURLToPath(new URL(relativePath, import.meta.url)),
	'utf8'
);

const rendererSource = readSource('../../src/graphics/MapRenderEngine.js');
const markupSource = readSource('../../src/tiferet/revelation/RevelationMarkup.js');
const atmosphereSource = readSource('../../src/design/revelation/vessels/atmosphere.css');

assert.doesNotMatch(rendererSource, /SkyGradientWeaver/);
assert.match(rendererSource, /OverheadWorldFoundation/);
assert.doesNotMatch(markupSource, /starfield|revelation-horizon/i);
assert.doesNotMatch(atmosphereSource, /starfield|revelation-horizon/i);
assert.match(markupSource, /data-revelation-minimap/);
assert.match(markupSource, /data-revelation-actions/);
assert.match(markupSource, /data-revelation-events/);

const state = {
	ActiveRealm: 'OVERWORLD',
	MapId: 'Bent_Reeds_Road',
	Hero: { cx: 10, cy: 5 },
	Stats: { level: 3, light: 73, maxLight: 100, sparks: 2 },
	Equipment: { weapon: 'WICK_BLADE' },
	Inventory: { items: { balm: 2, wick: 1 } },
	Campaign: { chapterIndex: 1 },
	Message: 'Return the Lost Wick remains active.'
};
const registry = [
	{ x: 10, y: 5, t: 'G_DIRT_PATH', char: '.', solid: false },
	{ x: 11, y: 5, t: 'G_WATER', char: '~', solid: true },
	{ x: 9, y: 5, t: 'G_TREE', char: '1', solid: true }
];
const model = buildRevelationViewModel(state, registry);
const heroCell = model.minimap.cells.find(cell => cell.hero);

assert.equal(model.vitality, 73);
assert.equal(model.vitalityPercent, 73);
assert.equal(heroCell.kind, 'road');
assert.equal(model.minimap.cells.length, 91);
assert.equal(model.actions[0].name, 'Wick Blade');
assert.equal(model.actions[2].count, 2);
assert.ok(model.events.some(event => event.text.includes('Return the Lost Wick')));

globalThis.__OHR_HAGNUZ_SHARED_JOURNEY__ = {
	connection: 'online',
	lastMessageType: 'ROAD_STATE',
	road: { lamp: { lit: true }, encounter: { health: 4, maxHealth: 8, defeated: false } }
};
const sharedModel = buildRevelationViewModel(state, registry);
assert.ok(sharedModel.events.some(event => event.text.includes('Shared Journey')));
assert.ok(sharedModel.events.some(event => event.text.includes('Veil Wisp')));
delete globalThis.__OHR_HAGNUZ_SHARED_JOURNEY__;

console.log('BH_TOP_DOWN_REVELATION_PASS');
