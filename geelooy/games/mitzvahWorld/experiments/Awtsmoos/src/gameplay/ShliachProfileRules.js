// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShliachProfileRules.js
 * @description Applies pure allocation, powerup, reward, level, synchronization, and expiry laws.
 * The Awtsmoos renews every earned spark beyond mutable illusion; Awtsmoos.com turns Shlichus
 * reward into bounded XP, mitzvah points, levels, and attribute vessels deterministically.
 */

import {
	SHLIACH_ATTRIBUTES,
	SHLIACH_POWERUPS,
	defaultShliachAttributes
} from './ShliachProfileCatalog.js';

const BASE_LEVEL_XP = 200;
const LEVEL_XP_GROWTH = 1.35;

export function createShliachProfileState(overrides = {}) {
	return {
		activePowerups: {},
		attributes: defaultShliachAttributes(),
		level: 1,
		mitzvahPoints: 0,
		perutas: null,
		unspentPoints: 3,
		xp: 0,
		...structuredClone(overrides)
	};
}

export function allocateShliachAttribute(state, attributeId, points) {
	const definition = SHLIACH_ATTRIBUTES[attributeId];
	if (!definition) throw new Error('ATTRIBUTE_NOT_FOUND');
	if (!Number.isInteger(points) || points < 1 || points > 5) {
		throw new Error('INVALID_ATTRIBUTE_POINTS');
	}
	if (state.unspentPoints < points) throw new Error('ATTRIBUTE_POINTS_UNAVAILABLE');
	if (state.attributes[attributeId] + points > definition.maximum) {
		throw new Error('ATTRIBUTE_MAXIMUM');
	}
	state.attributes[attributeId] += points;
	state.unspentPoints -= points;
}

export function awardShlichusProgress(state, reward = {}) {
	state.xp += nonNegativeInteger(reward.xp);
	state.mitzvahPoints += nonNegativeInteger(reward.mitzvahPoints);
	let levelsGained = 0;
	while (state.xp >= xpForNextLevel(state.level)) {
		state.xp -= xpForNextLevel(state.level);
		state.level += 1;
		state.unspentPoints += 2;
		levelsGained += 1;
	}
	return levelsGained;
}

export function xpForNextLevel(level) {
	return Math.round(BASE_LEVEL_XP * Math.pow(LEVEL_XP_GROWTH, Math.max(0, level - 1)));
}

export function activateShliachPowerup(state, inventory, powerupId, now) {
	const definition = SHLIACH_POWERUPS[powerupId];
	if (!definition) throw new Error('POWERUP_NOT_FOUND');
	if (state.perutas != null) {
		if (state.perutas < definition.cost) throw new Error('INSUFFICIENT_FUNDS');
		state.perutas -= definition.cost;
	} else {
		if (!inventory) throw new Error('PERUTA_WALLET_UNAVAILABLE');
		inventory.remove('perutas', definition.cost);
	}
	state.activePowerups[powerupId] = {
		activatedAt: now,
		expiresAt: now + definition.durationMs
	};
}

export function synchronizeShliachProfile(state, payload) {
	const source = payload?.shliach || payload;
	if (!source) return;
	for (const key of PROFILE_KEYS) {
		if (source[key] !== undefined) state[key] = structuredClone(source[key]);
	}
}

export function removeExpiredShliachPowerups(state, now) {
	for (const [powerupId, powerup] of Object.entries(state.activePowerups)) {
		if (powerup.expiresAt <= now) delete state.activePowerups[powerupId];
	}
}

function nonNegativeInteger(value) {
	return Math.max(0, Math.trunc(Number(value) || 0));
}

const PROFILE_KEYS = Object.freeze([
	'activePowerups',
	'attributes',
	'level',
	'mitzvahPoints',
	'perutas',
	'unspentPoints',
	'xp'
]);
