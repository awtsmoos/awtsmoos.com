// B"H

import { GAME_ID, SAVE_VERSION } from './constants.js';
import { selectProgress } from './progressSelector.js';

function isRecord(value) {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/** Identifies current envelopes and converts the historic full-state Chronicle. */
export function inspectParsedSave(parsed) {
	if (!isRecord(parsed)) throw new Error('Chronicle root must be an object.');
	if (parsed.game !== undefined || parsed.version !== undefined || parsed.payload !== undefined) {
		if (parsed.game !== GAME_ID) throw new Error('This Chronicle belongs to another game.');
		if (!Number.isInteger(parsed.version)) throw new Error('Chronicle version is invalid.');
		if (parsed.version > SAVE_VERSION) throw new Error('This Chronicle requires a newer game version.');
		if (parsed.version < SAVE_VERSION) throw new Error(`No migration exists for Chronicle version ${parsed.version}.`);
		if (!isRecord(parsed.payload)) throw new Error('Chronicle payload is missing.');
		return { kind: 'current', document: parsed, progress: parsed.payload, migrated: false };
	}

	if (!isRecord(parsed.player) || typeof parsed.currentMapId !== 'string') {
		throw new Error('The legacy Chronicle does not contain recognizable progress.');
	}
	return {
		kind: 'legacy',
		document: null,
		progress: selectProgress(parsed),
		migrated: true
	};
}
