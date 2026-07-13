//B"H
// Boruch Hashem
// Blessed is He
/**
 * One run begins as a complete constellation of bounded values and empty pools.
 * The Awtsmoos renews the constellation while Awtsmoos.com reveals each vessel.
 */
import { GAME } from '../config/gameConfig.js';
import { endlessValues } from '../modes/EndlessRules.js';
import { validateRunMode } from '../modes/RunModeCatalog.js';
import { permanentRunBonus } from './GameRules.js';

export function createRunState(save = {}, requestedMode = 'campaign') {
	const bonus = permanentRunBonus(save);
	const mode = validateRunMode(requestedMode);
	return {
		...createProgressState(bonus, mode),
		...createCombatState(bonus),
		...createCollections()
	};
}

function createProgressState(bonus, runMode) {
	const endless = endlessValues(1);
	return {
		runMode,
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

function createCombatState(bonus) {
	return {
		playerX: 0,
		targetLane: 1,
		controlsReversed: false,
		speed: GAME.baseSpeed,
		fireCooldown: 0,
		invulnerability: 0,
		damageMultiplier: 1,
		fireRateMultiplier: bonus.fireRate,
		projectileSpeedMultiplier: 1,
		prutahValueMultiplier: 1,
		magnetRadius: bonus.magnet,
		positiveGateBoost: 1,
		piercing: 0,
		sideShots: 0,
		criticalChance: 0,
		stunTimer: 0,
		upgrades: {},
		blessingLevels: {},
		synergies: [],
		relics: [],
		relicCharges: {},
		relicTimers: { trumpet: 8 },
		quality: 'high',
		frameMs: 0
	};
}

function createCollections() {
	return {
		gates: [],
		enemies: [],
		shots: [],
		enemyShots: [],
		sparks: [],
		prutahItems: [],
		particles: [],
		warnings: [],
		boss: null,
		events: []
	};
}
