// B"H
// Boruch Hashem
// Blessed is He

import { persistEntityRemoval } from '../world/entity/persistence.js';
import { getEntityAt } from '../world/entity/occupancy.js';
import { emitBattleEvent } from './battleEvents.js';

/**
 * @file Applies the authored consequence that belongs specifically to victory.
 * @description The Awtsmoos renews battle and aftermath together; without the
 * aftermath, victory is only a number. This bridge lets Awtsmoos.com remember
 * rescued roads, completed waves, and vanished threats as real changes in the
 * world that asked the player to stand within it.
 */

function removeWorldEntity(state, removal) {
	if (!removal) {
		return;
	}

	const map = state.maps?.[removal.mapId];
	const entity = getEntityAt(map, removal.x, removal.y);
	persistEntityRemoval(state, removal.mapId, entity);
}

/** Applies transient battle context only after the player has actually won. */
export function applyVictoryContext(state, sendToast) {
	const context = state.battle.context || {};

	if (context.questEvent) {
		emitBattleEvent(state, context.questEvent, sendToast);
	}
	if (context.flagOnWin) {
		state.player.flags ||= {};
		state.player.flags[context.flagOnWin] = true;
	}

	removeWorldEntity(state, context.removeEntity);
}
