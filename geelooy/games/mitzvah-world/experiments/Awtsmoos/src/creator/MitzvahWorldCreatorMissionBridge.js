// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorMissionBridge.js
 * @description Publishes player-authored missions into the live adventure store.
 * Yaakov 2026-10-11: a mission the player authors must be playable — offered,
 * accepted, and completed like any canonical mission. The bridge converts a
 * validated mission draft into the AdventureCatalog quest shape and registers
 * it with the runtime's adventure store; the unified quest store picks it up
 * through its existing change subscription.
 */

import { createMissionDraft, missionDraftToQuest } from './MitzvahWorldCreatorMissionAuthor.js';

/**
 * Authors a mission from a player draft and registers it with the live store.
 * @param {object} store AdventureStore (or UnifiedQuestStore.catalog) instance.
 * @param {object} draft Player mission draft (see MitzvahWorldCreatorMissionAuthor).
 * @returns {object} Frozen quest record now playable in the adventure store.
 */
export function publishPlayerMission(store, draft) {
	if (!store || typeof store.registerQuest !== 'function') {
		throw new Error('MISSION_BRIDGE_STORE_REQUIRED');
	}
	const validated = createMissionDraft(draft);
	const quest = missionDraftToQuest(validated);
	store.registerQuest(quest);
	return quest;
}

/**
 * Removes a player-authored mission from the live store.
 * @returns {boolean} True when the mission was registered and is now removed.
 */
export function unpublishPlayerMission(store, questId) {
	if (!store || typeof store.unregisterQuest !== 'function') {
		throw new Error('MISSION_BRIDGE_STORE_REQUIRED');
	}
	return store.unregisterQuest(questId);
}
