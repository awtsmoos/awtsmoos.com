//B"H
// Boruch Hashem
// Blessed is He
/**
 * A checkpoint preserves strategic consequence while discarding battlefield noise.
 * The Awtsmoos is beyond continuity while Awtsmoos.com reveals a guarded return.
 */
import { GAME } from '../config/gameConfig.js';
import { clamp } from '../game/GameRules.js';
import { endlessValues } from '../modes/EndlessRules.js';
import { validateRunMode } from '../modes/RunModeCatalog.js';

const ABILITIES = new Set([
	'lightBurst',
	'gatheringCall',
	'shofarBlast'
]);

export function validateCheckpoint(candidate) {
	if (!candidate || typeof candidate !== 'object') {
		return null;
	}
	const runMode = validateRunMode(candidate.runMode);
	const endlessCycle = endlessValues(candidate.endlessCycle).cycle;
	return {
		version: GAME.saveVersion,
		runMode,
		endlessCycle,
		worldIndex: clamp(candidate.worldIndex, 0, 4),
		levelIndex: clamp(candidate.levelIndex, 0, 4),
		troops: clamp(candidate.troops, 1, GAME.maximumTroops),
		health: clamp(candidate.health, 1, 9999),
		maxHealth: clamp(candidate.maxHealth, 1, 9999),
		shield: clamp(candidate.shield, 0, 99),
		maxShield: clamp(candidate.maxShield, 0, 99),
		prutahs: clamp(candidate.prutahs, 0, 9999999),
		score: clamp(candidate.score, 0, 999999999),
		distance: clamp(candidate.distance, 0, 999999999),
		bossesDefeated: clamp(candidate.bossesDefeated, 0, 99999),
		highestCombo: clamp(candidate.highestCombo, 0, 99999),
		abilityId: ABILITIES.has(candidate.abilityId) ?
			candidate.abilityId : 'lightBurst',
		abilityChosen: Boolean(candidate.abilityChosen),
		upgrades: levels(candidate.upgrades),
		blessingLevels: levels(candidate.blessingLevels),
		synergies: strings(candidate.synergies, 12),
		relics: strings(candidate.relics, 20),
		relicCharges: levels(candidate.relicCharges),
		relicTimers: timers(candidate.relicTimers),
		rules: validateRules(candidate.rules)
	};
}

function validateRules(rules = {}) {
	return {
		damageMultiplier: clamp(rules.damageMultiplier, 0.1, 100),
		fireRateMultiplier: clamp(rules.fireRateMultiplier, 0.1, 20),
		projectileSpeedMultiplier: clamp(rules.projectileSpeedMultiplier, 0.1, 20),
		prutahValueMultiplier: clamp(rules.prutahValueMultiplier, 0.1, 20),
		magnetRadius: clamp(rules.magnetRadius, 0.1, 30),
		positiveGateBoost: clamp(rules.positiveGateBoost, 0.1, 20),
		piercing: clamp(rules.piercing, 0, 20),
		sideShots: clamp(rules.sideShots, 0, 10),
		criticalChance: clamp(rules.criticalChance, 0, 1)
	};
}

function levels(value) {
	if (!value || typeof value !== 'object') {
		return {};
	}
	return Object.fromEntries(Object.entries(value).map(([id, level]) => {
		return [id, clamp(level, 0, 99)];
	}));
}

function timers(value) {
	const source = value && typeof value === 'object' ? value : {};
	return {
		trumpet: clamp(source.trumpet ?? 8, 0, 999)
	};
}

function strings(value, maximum) {
	if (!Array.isArray(value)) {
		return [];
	}
	return [...new Set(value.filter(item => typeof item === 'string'))]
		.slice(0, maximum);
}
