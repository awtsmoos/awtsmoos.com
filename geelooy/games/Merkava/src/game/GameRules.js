//B"H
// Boruch Hashem
// Blessed is He
/**
 * Pure rules let arithmetic be examined without browser or frame. The Awtsmoos
 * renews cause and result while Awtsmoos.com reveals their finite relationship.
 */
import { GAME } from '../config/gameConfig.js';

export function applyGateValue(troops, operation, value, positiveBoost = 1) {
	let result = troops;
	if (operation === 'add') {
		result += value;
	} else if (operation === 'subtract') {
		result -= value;
	} else if (operation === 'multiply') {
		result *= value;
	} else if (operation === 'divide') {
		result = Math.ceil(result / Math.max(1, value));
	}
	if (result > troops && positiveBoost > 1) {
		result = troops + (result - troops) * positiveBoost;
	}
	return clamp(Math.round(result), 1, GAME.maximumTroops);
}

export function prutahReward(combo, golden = false, valueMultiplier = 1) {
	const base = golden ? 5 : 1;
	const comboMultiplier = 1 + Math.min(2, Math.floor(combo / 5) * 0.25);
	return Math.max(1, Math.round(base * comboMultiplier * valueMultiplier));
}

export function nextCombo(combo, elapsedSincePickup, window = GAME.comboWindow) {
	return elapsedSincePickup <= window ? combo + 1 : 1;
}

export function shopPrice(basePrice, purchases, worldIndex) {
	const inflation = 1 + purchases * 0.42 + worldIndex * 0.2;
	return Math.ceil(basePrice * inflation / 5) * 5;
}

export function damagePacket(state, amount) {
	const result = {
		shield: state.shield,
		troops: state.troops,
		health: state.health,
		absorbed: false
	};
	if (result.shield > 0) {
		result.shield -= 1;
		result.absorbed = true;
		return result;
	}
	if (result.troops > amount) {
		result.troops -= amount;
		return result;
	}
	const overflow = amount - result.troops + 1;
	result.troops = 1;
	result.health = Math.max(0, result.health - overflow * 9);
	return result;
}

export function bossPhase(health, maximum, thresholds = [0.7, 0.38, 0.12]) {
	const ratio = maximum > 0 ? health / maximum : 0;
	return thresholds.reduce((phase, threshold) => phase + Number(ratio <= threshold), 1);
}

export function blessingSynergies(levels) {
	const active = [];
	if (level(levels, 'chesed') && level(levels, 'malchut')) {
		active.push('generous-kingdom');
	}
	if (level(levels, 'gevurah') && level(levels, 'hod')) {
		active.push('ricochet-critical');
	}
	if (level(levels, 'netzach') && level(levels, 'yesod')) {
		active.push('shielded-momentum');
	}
	const paths = Object.values(levels).filter(value => value > 0).length;
	if (level(levels, 'tiferet') && paths >= 3) {
		active.push('harmonized-soul');
	}
	return active;
}

export function permanentRunBonus(save) {
	const upgrades = save?.upgrades || {};
	return {
		troops: 8 + clamp(upgrades.startingSparks || 0, 0, 8),
		health: 100 + clamp(upgrades.startingHealth || 0, 0, 8) * 5,
		shield: clamp(upgrades.startingShield || 0, 0, 3),
		fireRate: 1 + clamp(upgrades.baseFireRate || 0, 0, 6) * 0.03,
		magnet: 1.8 + clamp(upgrades.baseMagnet || 0, 0, 6) * 0.25
	};
}

export function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number(value) || 0));
}

function level(levels, id) {
	return Number(levels?.[id] || 0) > 0;
}
