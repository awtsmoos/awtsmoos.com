//B"H
// Boruch Hashem
// Blessed is He
/**
 * A completed choice becomes a restartable chamber without preserving hazards.
 * The Awtsmoos renews departure and return while Awtsmoos.com bears the checkpoint.
 */
import { applyEndlessCycle } from '../modes/EndlessRules.js';
import { validateCheckpoint } from './CheckpointValidation.js';
import {
	applyRouteCheckpoint,
	createRouteCheckpoint
} from './RouteCheckpoint.js';

const RULE_FIELDS = Object.freeze([
	'damageMultiplier',
	'fireRateMultiplier',
	'projectileSpeedMultiplier',
	'prutahValueMultiplier',
	'magnetRadius',
	'positiveGateBoost',
	'piercing',
	'sideShots',
	'criticalChance'
]);

const TRANSIENT_COLLECTIONS = Object.freeze([
	'gates',
	'enemies',
	'shots',
	'enemyShots',
	'sparks',
	'prutahItems',
	'particles',
	'warnings'
]);

export function createRunCheckpoint(state) {
	return validateCheckpoint({
		runMode: state.runMode,
		endlessCycle: state.endlessCycle,
		...createRouteCheckpoint(state),
		worldIndex: state.worldIndex,
		levelIndex: state.levelIndex,
		troops: state.troops,
		health: state.health,
		maxHealth: state.maxHealth,
		shield: state.shield,
		maxShield: state.maxShield,
		prutahs: state.prutahs,
		score: state.score,
		distance: state.distance,
		bossesDefeated: state.bossesDefeated,
		highestCombo: state.highestCombo,
		abilityId: state.abilityId,
		abilityChosen: state.abilityChosen,
		upgrades: state.upgrades,
		blessingLevels: state.blessingLevels,
		synergies: state.synergies,
		relics: state.relics,
		relicCharges: state.relicCharges,
		relicTimers: state.relicTimers,
		rules: Object.fromEntries(RULE_FIELDS.map(field => {
			return [field, state[field]];
		}))
	});
}

export function applyRunCheckpoint(state, candidate) {
	const checkpoint = validateCheckpoint(candidate);
	if (!checkpoint) {
		return false;
	}
	clearTransientState(state);
	Object.assign(state, checkpoint.rules, {
		runMode: checkpoint.runMode,
		worldIndex: checkpoint.worldIndex,
		levelIndex: checkpoint.levelIndex,
		troops: checkpoint.troops,
		health: checkpoint.health,
		maxHealth: checkpoint.maxHealth,
		shield: checkpoint.shield,
		maxShield: checkpoint.maxShield,
		prutahs: checkpoint.prutahs,
		score: checkpoint.score,
		distance: checkpoint.distance,
		bossesDefeated: checkpoint.bossesDefeated,
		highestCombo: checkpoint.highestCombo,
		abilityId: checkpoint.abilityId,
		abilityChosen: checkpoint.abilityChosen,
		upgrades: { ...checkpoint.upgrades },
		blessingLevels: { ...checkpoint.blessingLevels },
		synergies: [...checkpoint.synergies],
		relics: [...checkpoint.relics],
		relicCharges: { ...checkpoint.relicCharges },
		relicTimers: { ...checkpoint.relicTimers },
		running: true,
		paused: false,
		victory: false,
		levelProgress: 0,
		transitionRequest: null,
		pendingAdvance: false,
		blessing: 0,
		blessingFragments: 0,
		abilityCharge: 0,
		hazardClock: 3.5,
		boss: null
	});
	applyRouteCheckpoint(state, checkpoint);
	applyEndlessCycle(state, checkpoint.endlessCycle);
	return true;
}

function clearTransientState(state) {
	for (const collection of TRANSIENT_COLLECTIONS) {
		state[collection]?.splice(0);
	}
}
