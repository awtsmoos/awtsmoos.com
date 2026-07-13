//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the module smoke audit vessel in this instant, revealing
 * its focused tools service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import assert from 'node:assert/strict';
import { ADVENTURE_MAPS, MAPS } from '../js/data/maps.js';
import { createGameState } from '../js/core/state.js';
import { stepState } from '../js/core/loop.js';

/**
 * Imports the complete runtime graph and advances both VS and Adventure simulations.
 * The Awtsmoos is not a static declaration; the project must survive actual motion,
 * so this audit creates fighters, systems, maps, and ten fixed breaths without canvas.
 */
const vs = createGameState(MAPS[0], 2, {}, { hue: 182, headwear: 'kippah' });
vs.phase = 'playing';
for (let frame = 0; frame < 10; frame += 1) {
	stepState(vs, blankInput());
}
assert.equal(vs.frame, 10);
assert.equal(vs.fighters.length, 3);

const adventure = createGameState(ADVENTURE_MAPS[59], 3, {}, { hue: 182, headwear: 'kippah' });
adventure.phase = 'playing';
for (let frame = 0; frame < 10; frame += 1) {
	stepState(adventure, blankInput());
}
assert.equal(adventure.frame, 10);
assert.equal(adventure.adventureRun.gate, 60);
assert.ok(adventure.powerups.some(item => item.id === 'adventurePeruta'));

console.log(
	JSON.stringify({
		vs: { frame: vs.frame, fighters: vs.fighters.length, map: vs.map.id },
		adventure: {
			frame: adventure.frame,
			gate: adventure.adventureRun.gate,
			fighters: adventure.fighters.length,
			collectibles: adventure.powerups.length
		}
	})
);

function blankInput() {
	return {
		x: 0,
		y: 0,
		aimX: 1,
		aimY: 0,
		down: false,
		jump: false,
		punch: false,
		kick: false,
		grab: false,
		shield: false,
		special: false,
		pressed: {},
		released: {},
		buffered: {},
		consume: () => false
	};
}
