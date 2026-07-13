// B"H
// Boruch Hashem
// Blessed is He

import { TILE_SIZE } from '../../../data/database.js';
import { maps } from '../../../data/maps.js';
import { emitQuestEvent } from './questEvents.js';
import { findActiveQuest } from './questState.js';

const SOLID = new Set(['🌳', '🏠', '🪨', '🔥', '🌊', '💎', '📜', '📚', '🕳️', '☁️', '⬛', '🧱', '⛰️']);

function destinationObjective(quest) {
	return quest?.objectives?.find(objective => !objective.completed && objective.mapIds?.length) || null;
}

function focusLanding(map) {
	const focus = Object.values(map.interactables || {}).find(entity => entity.type === 'quest_focus');
	if (focus) {
		return { x: focus.x, y: Math.min((map.baseLayer?.length || 2) - 2, focus.y + 1), direction: 'up' };
	}
	for (let y = 1; y < (map.baseLayer?.length || 1) - 1; y += 1) {
		for (let x = 1; x < (map.baseLayer?.[y]?.length || 1) - 1; x += 1) {
			if (!SOLID.has(map.baseLayer[y][x])) return { x, y, direction: 'down' };
		}
	}
	return { x: 1, y: 1, direction: 'down' };
}

/** Carries the tracked thread to a known destination without inventing a map. */
export function journeyToQuest(state, questId, sendToast = null) {
	const quest = findActiveQuest(state, questId);
	const objective = destinationObjective(quest);
	const mapId = objective?.mapIds?.[0];
	const map = maps[mapId] || state.generatedMaps?.[mapId];
	if (!quest || !objective || !map) {
		if (sendToast) sendToast('This objective has no safe Chronicle route.', 'error');
		return false;
	}
	const landing = focusLanding(map);
	state.currentMapId = mapId;
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
	emitQuestEvent(state, { type: 'reach_map', targetId: mapId, mapId }, sendToast);
	if (sendToast) sendToast(`Journeyed to ${map.name || mapId}.`, 'info');
	return true;
}
