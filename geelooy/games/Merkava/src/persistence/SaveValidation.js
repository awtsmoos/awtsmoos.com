//B"H
// Boruch Hashem
// Blessed is He
/**
 * Persisted values cross a guarded boundary before they may influence a run.
 * The Awtsmoos is beyond corruption while Awtsmoos.com reveals repaired memory.
 */
import { GAME } from '../config/gameConfig.js';
import { clamp } from '../game/GameRules.js';
import { validateCheckpoint } from './CheckpointValidation.js';
import {
	createDefaultModeRecords,
	createDefaultRecords,
	createDefaultSave
} from './SaveDefaults.js';
import { validateRunHistory } from './RunHistory.js';

export function validateSave(candidate) {
	const base = createDefaultSave();
	if (!candidate || typeof candidate !== 'object') {
		return base;
	}
	base.permanentPrutahs = clamp(candidate.permanentPrutahs, 0, 9999999);
	base.highestWorld = clamp(candidate.highestWorld, 0, 4);
	base.upgrades = validateLevels(candidate.upgrades);
	base.relics = validateRelics(candidate.relics);
	base.activeRun = validateCheckpoint(candidate.activeRun);
	base.records = validateRecords(candidate.records);
	base.modeRecords = validateModeRecords(candidate.modeRecords);
	base.runHistory = validateRunHistory(candidate.runHistory);
	base.settings = validateSettings(candidate.settings);
	return base;
}

function validateLevels(upgrades) {
	if (!upgrades || typeof upgrades !== 'object') {
		return {};
	}
	return Object.fromEntries(Object.entries(upgrades).map(([id, value]) => {
		return [id, clamp(value, 0, 12)];
	}));
}

function validateRelics(relics) {
	if (!Array.isArray(relics)) {
		return [];
	}
	return [...new Set(relics.filter(value => typeof value === 'string'))]
		.slice(0, 50);
}

function validateRecords(records) {
	const source = records && typeof records === 'object' ?
		records : createDefaultRecords();
	return {
		bestDistance: clamp(source.bestDistance, 0, 99999999),
		bestTroops: clamp(source.bestTroops, 0, GAME.maximumTroops),
		highestCombo: clamp(source.highestCombo, 0, 99999),
		bossesDefeated: clamp(source.bossesDefeated, 0, 99999),
		victories: clamp(source.victories, 0, 99999)
	};
}

function validateModeRecords(records) {
	const source = records?.endless || createDefaultModeRecords().endless;
	return {
		endless: {
			bestCycle: clamp(source.bestCycle, 0, 999),
			bestDistance: clamp(source.bestDistance, 0, 999999999),
			bestScore: clamp(source.bestScore, 0, 999999999)
		}
	};
}

function validateSettings(settings) {
	const source = settings && typeof settings === 'object' ? settings : {};
	return {
		muted: Boolean(source.muted),
		volume: clamp(source.volume ?? 0.65, 0, 1),
		quality: ['low', 'medium', 'high'].includes(source.quality) ?
			source.quality : 'high',
		tutorialComplete: Boolean(source.tutorialComplete)
	};
}

export { createDefaultSave } from './SaveDefaults.js';
