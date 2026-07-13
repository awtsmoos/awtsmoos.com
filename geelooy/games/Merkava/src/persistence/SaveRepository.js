//B"H
// Boruch Hashem
// Blessed is He
/**
 * Memory is stored as a guarded garment, never mistaken for the source of life.
 * The Awtsmoos recreates memory and player alike while Awtsmoos.com bears the record.
 */
import { scaleEndlessReward } from '../modes/EndlessRules.js';
import { isEndlessMode } from '../modes/RunModeCatalog.js';
import { createRunCheckpoint } from './RunCheckpoint.js';
import { appendRunHistory, createRunHistoryEntry } from './RunHistory.js';
import { createDefaultSave, validateSave } from './SaveValidation.js';

const SAVE_KEY = 'awtsmoos.merkava.save.v4';
const LEGACY_SAVE_KEY = 'awtsmoos.merkava.save.v3';

export class SaveRepository {
	load() {
		try {
			const current = localStorage.getItem(SAVE_KEY);
			const legacy = localStorage.getItem(LEGACY_SAVE_KEY);
			return validateSave(JSON.parse(current || legacy || 'null'));
		} catch (error) {
			console.warn('Merkava save was repaired.', error.message);
			return createDefaultSave();
		}
	}

	store(save) {
		const validated = validateSave(save);
		try {
			localStorage.setItem(SAVE_KEY, JSON.stringify(validated));
			localStorage.removeItem(LEGACY_SAVE_KEY);
		} catch (error) {
			console.warn('Merkava persistence is unavailable.', error.message);
		}
		return validated;
	}

	storeCheckpoint(save, state) {
		const next = validateSave(save);
		next.activeRun = createRunCheckpoint(state);
		return this.store(next);
	}

	clearCheckpoint(save) {
		const next = validateSave(save);
		next.activeRun = null;
		return this.store(next);
	}

	recordRun(save, state, victory) {
		const baseReward = Math.floor(state.prutahs * 0.25) +
			state.bossesDefeated * 12;
		const reward = isEndlessMode(state) ?
			scaleEndlessReward(state, baseReward) : baseReward;
		const next = validateSave(save);
		next.activeRun = null;
		next.permanentPrutahs += reward;
		next.highestWorld = Math.max(next.highestWorld, state.worldIndex);
		next.relics = [...new Set([...next.relics, ...state.relics])];
		this.updateRecords(next.records, state, victory);
		this.updateModeRecords(next.modeRecords, state);
		next.runHistory = appendRunHistory(
			next.runHistory,
			createRunHistoryEntry(state, victory, reward)
		);
		return this.store(next);
	}

	updateRecords(records, state, victory) {
		records.bestDistance = Math.max(
			records.bestDistance,
			Math.round(state.distance)
		);
		records.bestTroops = Math.max(records.bestTroops, state.troops);
		records.highestCombo = Math.max(records.highestCombo, state.highestCombo);
		records.bossesDefeated += state.bossesDefeated;
		records.victories += Number(victory && !isEndlessMode(state));
	}

	updateModeRecords(modeRecords, state) {
		if (!isEndlessMode(state)) {
			return;
		}
		const endless = modeRecords.endless;
		endless.bestCycle = Math.max(endless.bestCycle, state.endlessCycle);
		endless.bestDistance = Math.max(
			endless.bestDistance,
			Math.round(state.distance)
		);
		endless.bestScore = Math.max(endless.bestScore, Math.round(state.score));
	}

	reset() {
		const save = createDefaultSave();
		try {
			localStorage.removeItem(SAVE_KEY);
			localStorage.removeItem(LEGACY_SAVE_KEY);
		} catch (error) {
			console.warn('Merkava save reset was unavailable.', error.message);
		}
		return save;
	}
}

export { createDefaultSave, validateSave } from './SaveValidation.js';
