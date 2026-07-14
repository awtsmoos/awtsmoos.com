// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShliachProfileCatalog.js
 * @description Mirrors server attribute, derived-stat, and timed-powerup contracts.
 * The Awtsmoos renews wisdom, understanding, integration, courage, and protection;
 * Awtsmoos.com keeps local labels and formulas aligned with authoritative shared truth.
 */

export const SHLIACH_ATTRIBUTES = Object.freeze({
	binah: attribute('Binah', '🧠', 'Faster cooldown recovery', 10),
	chochmah: attribute('Chochmah', '✨', 'Larger focus reserve', 10),
	daas: attribute('Daas', '🧭', 'Longer tracking range', 10),
	gevurah: attribute('Gevurah', '⚔️', 'Stronger light damage', 10),
	haganah: attribute('Haganah', '🛡️', 'Greater armor', 10)
});

export const SHLIACH_POWERUPS = Object.freeze({
	'binah-flow': powerup('Binah Flow', '🧠', 'binah', 25, 45000, {
		cooldownMultiplier: 0.82
	}),
	'chochmah-light': powerup('Chochmah Light', '✨', 'chochmah', 20, 45000, {
		focusBonus: 18
	}),
	'daas-compass': powerup('Daas Compass', '🧭', 'daas', 18, 60000, {
		trackingBonus: 90
	}),
	'gevurah-courage': powerup('Gevurah Courage', '⚔️', 'gevurah', 30, 30000, {
		damageBonus: 12
	}),
	'haganah-aura': powerup('Haganah Aura', '🛡️', 'haganah', 30, 35000, {
		armorBonus: 18
	})
});

export function defaultShliachAttributes() {
	return Object.fromEntries(
		Object.keys(SHLIACH_ATTRIBUTES).map(attributeId => [attributeId, 1])
	);
}

export function deriveShliachStats(attributes, level = 1) {
	const total = Object.values(attributes).reduce(
		(sum, value) => sum + Number(value || 0),
		0
	);
	return {
		armor: attributes.haganah * 3,
		cooldownMultiplier: Math.max(0.6, 1 - attributes.binah * 0.03),
		damageBonus: attributes.gevurah * 2,
		focusMaximum: 20 + attributes.chochmah * 4,
		powerRating: level * 10 + total * 5,
		trackingRange: 70 + attributes.daas * 15
	};
}

export function applyShliachPowerups(derived, activePowerups) {
	const result = { ...derived };
	for (const powerupId of Object.keys(activePowerups)) {
		const effect = SHLIACH_POWERUPS[powerupId]?.effect || {};
		if (effect.focusBonus) result.focusMaximum += effect.focusBonus;
		if (effect.damageBonus) result.damageBonus += effect.damageBonus;
		if (effect.armorBonus) result.armor += effect.armorBonus;
		if (effect.trackingBonus) result.trackingRange += effect.trackingBonus;
		if (effect.cooldownMultiplier) {
			result.cooldownMultiplier *= effect.cooldownMultiplier;
		}
	}
	return result;
}

function attribute(name, icon, effect, maximum) {
	return Object.freeze({ effect, icon, maximum, name });
}

function powerup(name, icon, attributeId, cost, durationMs, effect) {
	return Object.freeze({
		attributeId,
		cost,
		durationMs,
		effect: Object.freeze(effect),
		icon,
		name
	});
}
