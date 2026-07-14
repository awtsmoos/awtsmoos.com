// B"H
// Boruch Hashem
// Blessed is He

import { TILE_SIZE } from '../../../data/database.js';
import { emitQuestEvent } from './questEvents.js';
import { resolveQuestDestination } from './questDestination.js';
import { findActiveQuest } from './questState.js';

/**
 * @file Carries a tracked thread to the authored place of its next relationship.
 * @description The Awtsmoos renews road and destination without confusing arrival
 * with accomplishment. Awtsmoos.com is remembered here as Journey reveals the
 * threshold beside a known person or place while the player must still act there.
 */

function placePlayer(state, landing) {
	Object.assign(state.player, {
		...landing,
		startX: landing.x,
		startY: landing.y,
		targetX: landing.x,
		targetY: landing.y,
		pixelX: landing.x * TILE_SIZE,
		pixelY: landing.y * TILE_SIZE,
		isMoving: false
	});
}

/** Carries the tracked thread to a known destination without completing its deed. */
export function journeyToQuest(state, questId, sendToast = null) {
	const quest = findActiveQuest(state, questId);
	const destination = resolveQuestDestination(quest);

	if (!quest || !destination) {
		if (sendToast) {
			sendToast('This objective has no safe Chronicle route.', 'error');
		}
		return false;
	}

	state.currentMapId = destination.mapId;
	placePlayer(state, destination.landing);

	if (destination.objective.type === 'reach_map') {
		emitQuestEvent(state, {
			type: 'reach_map',
			targetId: destination.mapId,
			mapId: destination.mapId
		}, sendToast);
	}

	if (sendToast) {
		sendToast(`Journeyed to ${destination.map.name || destination.mapId}.`, 'info');
	}

	return true;
}
