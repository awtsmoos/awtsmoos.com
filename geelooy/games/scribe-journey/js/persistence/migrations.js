// B"H
// Boruch Hashem
// Blessed is He

import { GAME_ID, SAVE_VERSION } from './constants.js';
import { selectProgress } from './progressSelector.js';

function isRecord(value) {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function campaignReadyProgress(progress = {}) {
	const player = isRecord(progress.player) ? { ...progress.player } : {};
	for (const field of ['activeQuests', 'completedQuests', 'rewardedQuests', 'unlockedRecipes']) {
		player[field] = Array.isArray(player[field]) ? player[field] : [];
	}
	for (const field of ['questChoices', 'reputation', 'worldChanges']) {
		player[field] = isRecord(player[field]) ? player[field] : {};
	}
	player.trackedQuestId = typeof player.trackedQuestId === 'string' ? player.trackedQuestId : null;
	return { ...progress, player };
}

function inspectVersioned(parsed) {
	if (parsed.game !== GAME_ID) throw new Error('This Chronicle belongs to another game.');
	if (!Number.isInteger(parsed.version)) throw new Error('Chronicle version is invalid.');
	if (parsed.version > SAVE_VERSION) throw new Error('This Chronicle requires a newer game version.');
	if (!isRecord(parsed.payload)) throw new Error('Chronicle payload is missing.');
	if (parsed.version < 1) throw new Error(`No migration exists for Chronicle version ${parsed.version}.`);
	return {
		kind: 'current',
		document: parsed,
		progress: campaignReadyProgress(parsed.payload),
		migrated: parsed.version < SAVE_VERSION
	};
}

/** Verifies identity first, then reveals old progress inside the current vessel. */
export function inspectParsedSave(parsed) {
	if (!isRecord(parsed)) throw new Error('Chronicle root must be an object.');
	if (parsed.game !== undefined || parsed.version !== undefined || parsed.payload !== undefined) {
		return inspectVersioned(parsed);
	}
	if (!isRecord(parsed.player) || typeof parsed.currentMapId !== 'string') {
		throw new Error('The legacy Chronicle does not contain recognizable progress.');
	}
	return {
		kind: 'legacy',
		document: null,
		progress: campaignReadyProgress(selectProgress(parsed)),
		migrated: true
	};
}
