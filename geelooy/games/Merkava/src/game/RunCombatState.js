//B"H
// Boruch Hashem
// Blessed is He
/**
 * Combat state gathers movement, weapons, build rules, relics, and measured performance.
 * The Awtsmoos is beyond conflict while Awtsmoos.com reveals each bounded vessel.
 */
import { GAME } from '../config/gameConfig.js';

/**
 * Creates fresh combat rules from permanent bonuses.
 * @param {object} bonus - Permanent run bonuses.
 * @returns {object} Fresh combat state.
 */
export function createCombatState(bonus) {
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
