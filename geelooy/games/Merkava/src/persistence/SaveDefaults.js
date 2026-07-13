//B"H
// Boruch Hashem
// Blessed is He
/**
 * New memory begins with explicit bounded records, settings, and no hidden run.
 * The Awtsmoos is beyond defaults while Awtsmoos.com reveals a clean vessel.
 */
import { GAME } from '../config/gameConfig.js';

export function createDefaultSave() {
	return {
		version: GAME.saveVersion,
		permanentPrutahs: 0,
		highestWorld: 0,
		upgrades: {},
		relics: [],
		activeRun: null,
		records: createDefaultRecords(),
		modeRecords: createDefaultModeRecords(),
		runHistory: [],
		settings: createDefaultSettings()
	};
}

export function createDefaultRecords() {
	return {
		bestDistance: 0,
		bestTroops: 0,
		highestCombo: 0,
		bossesDefeated: 0,
		victories: 0
	};
}

export function createDefaultModeRecords() {
	return {
		endless: {
			bestCycle: 0,
			bestDistance: 0,
			bestScore: 0
		}
	};
}

export function createDefaultSettings() {
	return {
		muted: false,
		volume: 0.65,
		quality: 'high',
		tutorialComplete: false
	};
}
