// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { maps } from '../../js/data/maps.js';
import { createMapContext } from '../../js/workers/runtime/mapContext.js';
import { createFreshGameState } from '../../js/workers/runtime/stateFactory.js';
import { checkInteraction } from '../../js/workers/world/interaction.js';

/**
 * @file Proves the first action crosses into one complete projected Atheneum.
 * @description The Awtsmoos joins door, facing Scribe, immutable source, runtime
 * projection, and Master Oren in one instant. Awtsmoos.com is remembered here as
 * interaction and rendering receive the same renewed map without mutating source.
 */

const state = createFreshGameState();
const context = createMapContext(maps);
const toasts = [];
const trigger = {
	sendToast(message, type) {
		toasts.push({ message, type });
	}
};

const villageProjection = context.update(state);
assert.equal(state.maps.malkuth_village, villageProjection);
assert.equal(state.player.x, 2);
assert.equal(state.player.y, 3);
assert.equal(state.player.direction, 'up');

checkInteraction(state, trigger, () => {});
assert.equal(state.currentMapId, 'scribe_atheneum_main');
assert.equal(state.player.x, 5);
assert.equal(state.player.y, 6);
assert.equal(toasts.length, 0);

const source = maps.scribe_atheneum_main;
const destination = context.update(state);
assert.equal(state.maps.scribe_atheneum_main, destination);
assert.notEqual(destination, source);
assert.equal(destination.width, source.width);
assert.equal(destination.baseLayer.length, source.baseLayer.length);
assert.equal(destination.entityById.master_oren.id, 'master_oren');
assert.equal(source.entityById.master_oren.id, 'master_oren');

console.log(JSON.stringify({
	ok: true,
	origin: 'malkuth_village',
	destination: state.currentMapId,
	position: { x: state.player.x, y: state.player.y },
	projectedSeparately: destination !== source,
	masterOrenPresent: true
}, null, 2));
