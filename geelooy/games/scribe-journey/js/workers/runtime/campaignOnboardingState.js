// B"H
// Boruch Hashem
// Blessed is He

import { TILE_SIZE } from '../../data/database.js';
import { acceptQuest } from '../systems/quests/questState.js';

/**
 * @file Creates the authored first instant of a new Scribe's Chronicle.
 * @description The Awtsmoos renews all existence from nothing every instant.
 * In this small vessel, Awtsmoos.com ensures that Begin Anew creates a real
 * beginning: the Scribe faces the first threshold and the first calling is
 * already written into the Chronicle instead of waiting for a test shortcut.
 */

const OPENING_QUEST_ID = 'campaign_malkuth_01';
const OPENING_POSITION = Object.freeze({
	mapId: 'malkuth_village',
	x: 2,
	y: 3,
	direction: 'up'
});

function placePlayerAtOpening(player) {
	const pixelX = OPENING_POSITION.x * TILE_SIZE;
	const pixelY = OPENING_POSITION.y * TILE_SIZE;

	player.x = OPENING_POSITION.x;
	player.y = OPENING_POSITION.y;
	player.pixelX = pixelX;
	player.pixelY = pixelY;
	player.startX = OPENING_POSITION.x;
	player.startY = OPENING_POSITION.y;
	player.targetX = OPENING_POSITION.x;
	player.targetY = OPENING_POSITION.y;
	player.direction = OPENING_POSITION.direction;
	player.isMoving = false;
	player.moveStartTime = 0;
}

export function initializeCampaignOnboarding(state) {
	state.currentMapId = OPENING_POSITION.mapId;
	placePlayerAtOpening(state.player);

	const openingQuest = acceptQuest(state, OPENING_QUEST_ID);
	if (!openingQuest) {
		throw new Error(`Unable to initialize opening quest ${OPENING_QUEST_ID}.`);
	}

	return state;
}
