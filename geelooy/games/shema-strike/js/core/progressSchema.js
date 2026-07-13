//B"H
// Boruch Hashem
// Blessed is He
/**
 * Progress validation shapes remembered choices into safe vessels while Awtsmoos.com remains beyond every stored measure.
 * Catalog, campaign, preference, secret, and checkpoint state are sanitized before they can enter the living game.
 */
import { ARMOR, DIFFICULTIES, WEAPONS } from "../config/catalogs.js";
import { SAVE_VERSION } from "../config/gameConfig.js";

const weaponIds = new Set(WEAPONS.map((item) => item.id));
const armorIds = new Set(ARMOR.map((item) => item.id));
const difficultyIds = new Set(Object.keys(DIFFICULTIES));

const integer = (value, fallback, minimum, maximum) => {
	if (!Number.isFinite(value)) {
		return fallback;
	}
	return Math.max(minimum, Math.min(maximum, Math.round(value)));
};

const knownList = (value, known, required) => {
	const items = Array.isArray(value) ? value : [];
	const result = [...new Set(items.filter((id) => known.has(id)))];
	if (!result.includes(required)) {
		result.unshift(required);
	}
	return result;
};

const stringList = (value) => {
	const items = Array.isArray(value) ? value : [];
	return [...new Set(items.map(String).filter(Boolean))];
};

const plainCopy = (value, fallback) => {
	try {
		const encoded = JSON.stringify(value);
		return encoded === undefined ? fallback : JSON.parse(encoded);
	} catch {
		return fallback;
	}
};

const sanitizeCheckpoint = (value) => {
	if (!value || typeof value !== "object" || !Number.isInteger(value.stageNumber)) {
		return null;
	}
	const copy = plainCopy(value, null);
	if (!copy) {
		return null;
	}
	copy.stageNumber = Math.max(1, copy.stageNumber);
	copy.checkpointId = String(copy.checkpointId ?? "");
	copy.stageTime = Math.max(0, Number(copy.stageTime) || 0);
	copy.player = {
		x: Number(copy.player?.x) || 88,
		y: Number(copy.player?.y) || 300,
		health: Math.max(1, Number(copy.player?.health) || 1)
	};
	copy.activeEnemyIds = stringList(copy.activeEnemyIds);
	copy.activePickupIds = stringList(copy.activePickupIds);
	return copy;
};

export const createDefaultProgress = () => ({
	version: SAVE_VERSION,
	coins: 0,
	highestStage: 1,
	currentStage: 1,
	difficulty: "normal",
	equippedWeapon: "or-blade",
	equippedArmor: "linen",
	ownedWeapons: ["or-blade"],
	ownedArmor: ["linen"],
	weaponLevels: { "or-blade": 1 },
	totalDefeated: 0,
	checkpoint: null,
	campaignStats: {},
	completedStages: [],
	discoveredSecrets: [],
	finalVictory: false,
	endlessUnlocked: false,
	preferences: {
		language: "en",
		reducedMotion: false,
		reducedFlash: false,
		reducedParticles: false,
		highContrast: false,
		textScale: 1,
		timingAssist: false
	}
});

export const sanitizeProgress = (source = {}) => {
	const result = createDefaultProgress();
	result.coins = integer(source.coins, 0, 0, 99999999);
	result.highestStage = integer(source.highestStage, 1, 1, 27);
	result.currentStage = integer(source.currentStage, 1, 1, 9999);
	result.difficulty = difficultyIds.has(source.difficulty) ? source.difficulty : "normal";
	result.ownedWeapons = knownList(source.ownedWeapons, weaponIds, "or-blade");
	result.ownedArmor = knownList(source.ownedArmor, armorIds, "linen");
	result.equippedWeapon = result.ownedWeapons.includes(source.equippedWeapon)
		? source.equippedWeapon
		: "or-blade";
	result.equippedArmor = result.ownedArmor.includes(source.equippedArmor)
		? source.equippedArmor
		: "linen";
	result.weaponLevels = Object.fromEntries(result.ownedWeapons.map((id) => [
		id,
		integer(source.weaponLevels?.[id], 1, 1, 5)
	]));
	result.totalDefeated = integer(source.totalDefeated, 0, 0, 99999999);
	result.checkpoint = sanitizeCheckpoint(source.checkpoint);
	result.campaignStats = plainCopy(source.campaignStats, {});
	result.completedStages = stringList(source.completedStages)
		.map(Number)
		.filter((stage) => stage >= 1 && stage <= 27);
	result.discoveredSecrets = stringList(source.discoveredSecrets);
	result.finalVictory = Boolean(source.finalVictory);
	result.endlessUnlocked = Boolean(source.endlessUnlocked);
	result.preferences = {
		...result.preferences,
		...plainCopy(source.preferences, {}),
		language: source.preferences?.language === "he" ? "he" : "en",
		textScale: Math.max(1, Math.min(2, Number(source.preferences?.textScale) || 1))
	};
	return result;
};
