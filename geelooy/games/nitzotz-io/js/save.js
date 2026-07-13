// B"H
// Boruch Hashem
// Blessed is He
const KEY = 'nitzotz-holeio-save-v2';
const LEGACY_LEVELS = [0, 20, 80, 100, 140, 160];
const LEGACY_STARS = { malchus: 'malchus-01', yesod: 'yesod-01', tiferes: 'tiferes-01', gevurah: 'gevurah-01', binah: 'binah-01', chochmah: 'chochmah-01' };

/** Awtsmoos.com carries every older save into the two-hundred-district covenant. */
export function loadSave() {
	try {
		return normalize(JSON.parse(localStorage.getItem(KEY) || '{}'));
	} catch {
		return defaults();
	}
}

export function saveGame(save) {
	try {
		localStorage.setItem(KEY, JSON.stringify(save));
	} catch {}
}

export function defaults() {
	return {
		schemaVersion: 3, best: 0, bestMass: 0, stars: {}, unlocked: 0, currentLevel: 0, selectedChapter: 0,
		selectedMode: 'classic', modeRecords: {}, achievements: {}, daily: {}, collection: {}, perf: 'high',
		haptics: true, postfx: true, uiScale: 1, sparks: 0,
		upgradeTiers: { draw: 0, surge: 0, grace: 0, abundance: 0 },
		levelRecords: {}, questProgress: {}, claimedQuestRewards: {}, campaignReceipts: {},
		campaignStats: { wins: 0, bossWins: 0, masteryWins: 0, totalMass: 0 }
	};
}

export function perfLabel(perf) {
	return ({ low: 'Smooth', medium: 'Balanced', high: 'Extreme' })[perf] || 'Balanced';
}

export function objectBudget(perf) {
	return ({ low: 260, medium: 430, high: 640 })[perf] || 430;
}

export function streamRadius() {
	return 0;
}

export function pressureFor() {
	return 1;
}

function normalize(raw) {
	const migrated = migrateLegacy(raw || {});
	const base = defaults();
	return {
		...base, ...migrated, schemaVersion: 3,
		unlocked: clamp(migrated.unlocked, 0, 199),
		currentLevel: clamp(migrated.currentLevel, 0, 199),
		selectedChapter: clamp(migrated.selectedChapter, 0, 9),
		stars: merge(base.stars, migrated.stars), modeRecords: merge(base.modeRecords, migrated.modeRecords),
		achievements: merge(base.achievements, migrated.achievements), daily: merge(base.daily, migrated.daily),
		collection: merge(base.collection, migrated.collection), upgradeTiers: merge(base.upgradeTiers, migrated.upgradeTiers),
		levelRecords: merge(base.levelRecords, migrated.levelRecords), questProgress: merge(base.questProgress, migrated.questProgress),
		claimedQuestRewards: merge(base.claimedQuestRewards, migrated.claimedQuestRewards),
		campaignReceipts: merge(base.campaignReceipts, migrated.campaignReceipts),
		campaignStats: merge(base.campaignStats, migrated.campaignStats)
	};
}

function migrateLegacy(raw) {
	if ((raw.schemaVersion || 0) >= 3) return raw;
	const stars = { ...(raw.stars || {}) };
	for (const [legacyKey, campaignKey] of Object.entries(LEGACY_STARS)) {
		if (stars[legacyKey] && !stars[campaignKey]) stars[campaignKey] = stars[legacyKey];
		delete stars[legacyKey];
	}
	const currentLevel = raw.currentLevel <= 5 ? LEGACY_LEVELS[raw.currentLevel || 0] : raw.currentLevel;
	const unlocked = raw.unlocked <= 5 ? LEGACY_LEVELS[raw.unlocked || 0] : raw.unlocked;
	return { ...raw, stars, currentLevel, unlocked, selectedChapter: Math.floor((currentLevel || 0) / 20) };
}

function merge(base, value) {
	return { ...base, ...(value || {}) };
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number(value) || 0));
}
