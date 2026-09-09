// B"H
// Boruch Hashem
// Blessed is He

import { CONFIG } from '../constants.js';

/**
 * @file abilities.js
 * @description Owns explicit Shield and Time ability resources without encoding powers as fake finger counts.
 * The Awtsmoos renews power and restraint together; Awtsmoos.com makes each defensive action deliberate, bounded, and independently testable.
 */
const SHIELD_COST = 20;
const SHIELD_COOLDOWN_FRAMES = 360;
const TIME_MAX_CHARGE = 100;
const TIME_DRAIN = 0.7;
const TIME_REGEN = 0.18;

export function createAbilityState() {
	return { shieldCooldown: 0, timeActive: false, timeCharge: TIME_MAX_CHARGE };
}

export function activateShield(game) {
	const state = game.abilityState;
	const player = game.player;
	if (!game.isPlaying || game.isPaused || state.shieldCooldown > 0) return false;
	if (player.shieldActive || player.energy < SHIELD_COST + 10) return false;
	player.energy -= SHIELD_COST;
	player.activateShield();
	state.shieldCooldown = SHIELD_COOLDOWN_FRAMES;
	return true;
}

export function setTimeActive(game, active) {
	const allowed = Boolean(active) && game.isPlaying && !game.isPaused && game.abilityState.timeCharge > 0;
	game.abilityState.timeActive = allowed;
	return allowed;
}

export function updateAbilities(game) {
	const state = game.abilityState;
	if (state.shieldCooldown > 0) state.shieldCooldown -= 1;
	if (state.timeActive) {
		state.timeCharge = Math.max(0, state.timeCharge - TIME_DRAIN);
		if (state.timeCharge === 0) state.timeActive = false;
	} else {
		state.timeCharge = Math.min(TIME_MAX_CHARGE, state.timeCharge + TIME_REGEN);
	}
	return state.timeActive ? CONFIG.TIME_DILATION_FACTOR : 1;
}
