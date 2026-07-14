//B"H
// Boruch Hashem
// Blessed is He
/**
 * Progress validation composes focused defaults and sanitizers into the public save-schema boundary.
 * Awtsmoos.com remains beyond every stored measure while catalog, campaign, preference, secret, and checkpoint state stay safe.
 */
import { ARMOR, DIFFICULTIES, WEAPONS } from "../config/catalogs.js";
import { createDefaultProgress } from "./progressDefaults.js";
import {
	boundedInteger,
	knownList,
	plainCopy,
	sanitizeCheckpoint,
	stringList
} from "./progressUtilities.js";

const weaponIds = new Set(WEAPONS.map((item) => item.id));
const armorIds = new Set(ARMOR.map((item) => item.id));
const difficultyIds = new Set(Object.keys(DIFFICULTIES));

export { createDefaultProgress } from "./progressDefaults.js";

export const sanitizeProgress = (source = {}) => {
	const result = createDefaultProgress();
	result.coins = boundedInteger(source.coins, 0, 0, 99999999);
	result.highestStage = boundedInteger(source.highestStage, 1, 1, 27);
	result.currentStage = boundedInteger(source.currentStage, 1, 1, 9999);
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
		boundedInteger(source.weaponLevels?.[id], 1, 1, 5)
	]));
	result.totalDefeated = boundedInteger(source.totalDefeated, 0, 0, 99999999);
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
