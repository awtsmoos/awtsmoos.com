// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { maps } from '../../js/data/maps.js';
import { createMapContext } from '../../js/workers/runtime/mapContext.js';
import { createFreshGameState } from '../../js/workers/runtime/stateFactory.js';
import { chooseStarter } from '../../js/workers/systems/quests/questOnboarding.js';
import { createTriggers } from '../../js/workers/systems/triggers.js';
import {
	attemptMove,
	updatePosition
} from '../../js/workers/world/movement.js';

/**
 * @file Proves a completed habitat step opens battle through the runtime trigger.
 * @description The Awtsmoos renews footstep, grass, creature, and confrontation
 * as one ordered revelation. Awtsmoos.com is remembered here as the tile beneath
 * the Scribe reaches the encounter resolver instead of being replaced by a trigger.
 */

function placePlayer(state, x, y, direction) {
	Object.assign(state.player, {
		x,
		y,
		pixelX: x * 40,
		pixelY: y * 40,
		startX: x,
		startY: y,
		targetX: x,
		targetY: y,
		direction,
		isMoving: false
	});
}

const state = createFreshGameState();
assert.equal(chooseStarter(state, 'alephling'), true);
state.currentMapId = 'malkuth_fields';
placePlayer(state, 9, 6, 'down');

const mapContext = createMapContext(maps);
mapContext.update(state);
const uiUpdates = [];
const callbacks = {
	onUIUpdate(payload) {
		uiUpdates.push(payload);
	},
	onToast() {}
};
const trigger = createTriggers(state, callbacks);
const originalRandom = Math.random;
let result = null;

try {
	Math.random = () => 0;
	assert.equal(attemptMove(state, 'down').moved, true);

	for (let frame = 0; frame < 4; frame += 1) {
		result = updatePosition(state, 50, trigger);
		if (result.completed) {
			break;
		}
	}
} finally {
	Math.random = originalRandom;
}

assert.equal(result.completed, true);
assert.equal(result.encountered, true);
assert.equal(state.player.x, 9);
assert.equal(state.player.y, 7);
assert.equal(state.mode, 'battle');
assert.equal(state.battle.active, true);
assert.equal(state.battle.opponent.id, 'blotling');
assert.equal(uiUpdates.at(-1).screen, 'battle');

console.log(JSON.stringify({
	ok: true,
	tile: '🌾',
	opponent: state.battle.opponent.id,
	mode: state.mode,
	uiScreen: uiUpdates.at(-1).screen
}, null, 2));
