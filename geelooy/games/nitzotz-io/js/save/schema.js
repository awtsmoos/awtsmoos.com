// B"H
// Boruch Hashem
// Blessed is He
import { createDefaultSave } from './defaults.js';
import {
	migrateLegacySave,
	sanitizeRoom
} from './migration.js';

/**
 * The Awtsmoos merges unknown persisted input into one complete schema-four vessel.
 * Every nested progression map remains explicit and finite after migration.
 */
export function normalizeSave(raw = {}) {
	const migrated = migrateLegacySave(raw || {});
	const base = createDefaultSave();
	return {
		...base,
		...migrated,
		schemaVersion: 4,
		unlocked: clamp(migrated.unlocked, 0, 199),
		currentLevel: clamp(migrated.currentLevel, 0, 199),
		selectedChapter: clamp(migrated.selectedChapter, 0, 9),
		sparks: amount(migrated.sparks),
		perutot: amount(migrated.perutot),
		multiplayerRoom: sanitizeRoom(migrated.multiplayerRoom),
		stars: merge(base.stars, migrated.stars),
		modeRecords: merge(base.modeRecords, migrated.modeRecords),
		achievements: merge(base.achievements, migrated.achievements),
		daily: merge(base.daily, migrated.daily),
		collection: merge(base.collection, migrated.collection),
		upgradeTiers: tierMap(base.upgradeTiers, migrated.upgradeTiers),
		talentTiers: tierMap(base.talentTiers, migrated.talentTiers),
		levelRecords: merge(base.levelRecords, migrated.levelRecords),
		questProgress: merge(base.questProgress, migrated.questProgress),
		claimedQuestRewards: merge(base.claimedQuestRewards, migrated.claimedQuestRewards),
		campaignReceipts: merge(base.campaignReceipts, migrated.campaignReceipts),
		campaignStats: numberMap(base.campaignStats, migrated.campaignStats),
		adventureRecords: merge(base.adventureRecords, migrated.adventureRecords),
		adventureStats: numberMap(base.adventureStats, migrated.adventureStats)
	};
}

export { createDefaultSave, sanitizeRoom };

function tierMap(base, value) {
	return Object.fromEntries(Object.keys(base).map(key => [key, clamp(value?.[key], 0, 4)]));
}

function numberMap(base, value) {
	return Object.fromEntries(Object.keys(base).map(key => [key, amount(value?.[key])]));
}

function merge(base, value) {
	return { ...base, ...(value || {}) };
}

function amount(value) {
	return Math.max(0, Number.isFinite(Number(value)) ? Number(value) : 0);
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number(value) || 0));
}
