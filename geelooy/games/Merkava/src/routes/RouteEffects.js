//B"H
// Boruch Hashem
// Blessed is He
/**
 * Every selected road alters the living run so no choice becomes painted scenery.
 * The Awtsmoos is beyond reward and danger while Awtsmoos.com reveals consequence.
 */
import { GAME } from '../config/gameConfig.js';
import { clamp } from '../game/GameRules.js';
import { routeDefinition } from './RouteCatalog.js';

const EFFECTS = Object.freeze({
	'guarded-road': state => {
		state.troops = clamp(state.troops + 6, 1, GAME.maximumTroops);
		return 'SIX HOLY SPARKS JOINED THE FORMATION';
	},
	'elite-ambush': state => {
		state.health = Math.max(1, state.health - 12);
		state.prutahs = clamp(state.prutahs + 55, 0, 9999999);
		state.score = clamp(state.score + 700, 0, 999999999);
		return 'THE AMBUSH BROKE · 55 PRUTAHS CLAIMED';
	},
	'healing-spring': state => {
		const healing = Math.max(1, Math.round(state.maxHealth * 0.3));
		state.health = Math.min(state.maxHealth, state.health + healing);
		return 'THE SPRING RESTORED THE CHARIOT';
	},
	'shield-shrine': state => {
		state.maxShield = clamp(state.maxShield + 1, 0, 99);
		state.shield = Math.min(state.maxShield, state.shield + 1);
		state.abilityCharge = clamp(state.abilityCharge + 25, 0, 100);
		return 'A SHIELD CHARGE SEALED THE FORMATION';
	},
	'prutah-vault': state => {
		state.prutahs = clamp(state.prutahs + 40, 0, 9999999);
		return 'FORTY PRUTAHS RECOVERED';
	},
	'gevurah-trial': state => {
		state.maxHealth = Math.max(20, state.maxHealth - 5);
		state.health = Math.min(state.health, state.maxHealth);
		state.damageMultiplier = clamp(
			state.damageMultiplier * 1.12,
			0.1,
			100
		);
		return 'GEVURAH BURNED AWAY WEAKNESS';
	},
	'prutah-storm': state => {
		state.prutahs = clamp(state.prutahs + 15, 0, 9999999);
		state.prutahValueMultiplier = clamp(
			state.prutahValueMultiplier * 1.15,
			0.1,
			20
		);
		return 'THE STORM DEEPENED EVERY FUTURE COIN';
	}
});

/**
 * Applies one bounded route effect to strategic run state.
 * @param {object} state - Mutable game state vessel.
 * @param {string} routeId - Offered route identifier.
 * @returns {{ok: boolean, message: string}} Resolution result.
 */
export function applyRouteEffect(state, routeId) {
	const route = routeDefinition(routeId);
	const effect = route && EFFECTS[route.id];
	if (!effect) {
		return {
			ok: false,
			message: 'THE ROAD COULD NOT BE READ'
		};
	}
	return {
		ok: true,
		message: effect(state)
	};
}
