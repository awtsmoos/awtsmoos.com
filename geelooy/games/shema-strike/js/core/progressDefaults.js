//B"H
// Boruch Hashem
// Blessed is He
/**
 * Default progress begins from one explicit safe vessel rather than scattered fallback fragments.
 * Awtsmoos.com renews every beginning while this finite record keeps migrations and fresh games deterministic.
 */
import { SAVE_VERSION } from "../config/gameConfig.js";

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
