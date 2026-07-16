//B"H
// Boruch Hashem
// Blessed is He
/**
 * Progress state carries the road, world, economy, command, and finite life of one run.
 * The Awtsmoos is beyond sequence while Awtsmoos.com reveals every renewed milestone.
 */
import { GAME } from '../config/gameConfig.js';
import { endlessValues } from '../modes/EndlessRules.js';

/**
 * Creates strategic run progression without combat collections or projectile rules.
 * @param {object} bonus - Permanent run bonuses.
 * @param {string} runMode - Validated run mode identifier.
 * @param {number} runSeed - Stable route generation seed.
 * @returns {object} Fresh strategic progression state.
 */
export function createProgressState(bonus, runMode, runSeed) {
	const endless = endlessValues(1);
	return {
		runMode,
		runSeed,
		routeStep: 0,
		routeChoices: [],
		routeHistory: [],
		routeModifier: null,
		endlessCycle: endless.cycle,
		endlessThreat: endless.threat,
		endlessMutator: endless.mutator,
		endlessSpeedMultiplier: endless.speedMultiplier,
		endlessEncounterMultiplier: endless.encounterDelayMultiplier,
		endlessDepthBonus: endless.enemyDepthBonus,
		endlessBossHealthMultiplier: endless.bossHealthMultiplier,
		endlessBossCadenceMultiplier: endless.bossCadenceMultiplier,
		endlessRewardMultiplier: endless.rewardMultiplier,
		running: false,
		paused: false,
		victory: false,
		elapsed: 0,
		distance: 0,
		levelProgress: 0,
		worldIndex: 0,
		levelIndex: 0,
		transitionRequest: null,
		pendingAdvance: false,
		bossesDefeated: 0,
		score: 0,
		prutahs: 0,
		combo: 0,
		highestCombo: 0,
		comboAge: GAME.comboWindow + 1,
		blessingFragments: 0,
		blessing: 0,
		abilityCharge: 0,
		abilityId: 'lightBurst',
		abilityChosen: false,
		abilityCooldown: 0,
		hazardClock: 4,
		troops: bonus.troops,
		health: bonus.health,
		maxHealth: bonus.health,
		shield: bonus.shield,
		maxShield: bonus.shield
	};
}
