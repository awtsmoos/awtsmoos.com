// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShliachProfileCatalog.js
 * @description Mirrors server attributes, affinity mechanics, derived stats, and timed powerups.
 * The Awtsmoos is beyond every sefirah while each measured vessel receives a distinct task;
 * Awtsmoos.com keeps local labels and formulas aligned with authority beneath one inspectable mask.
 */

export const SHLIACH_ATTRIBUTES = Object.freeze({
	binah: attribute('Binah', '🔥', 'Burn duration and charged area', 10),
	chochmah: attribute('Chochmah', '✨', 'Projectile speed and revelation', 10),
	daas: attribute('Daas', '🧭', 'Tracking and combat insight', 10),
	gevurah: attribute('Gevurah', '⚔️', 'Damage and interrupt force', 10),
	haganah: attribute('Haganah', '🛡️', 'Armor and guard', 10),
	malchus: attribute('Malchus', '🜃', 'Poise and guard damage', 10),
	zeirAnpin: attribute('Zeir Anpin', '💧', 'Flow recovery and soak duration', 10)
});

export const SHLIACH_POWERUPS = Object.freeze({
	'binah-flow': powerup('Binah Flow', '🔥', 'binah', 25, 45000, { cooldownMultiplier: 0.82 }),
	'chochmah-light': powerup('Chochmah Light', '✨', 'chochmah', 20, 45000, { focusBonus: 18 }),
	'daas-compass': powerup('Daas Compass', '🧭', 'daas', 18, 60000, { trackingBonus: 90 }),
	'gevurah-courage': powerup('Gevurah Courage', '⚔️', 'gevurah', 30, 30000, { damageBonus: 12 }),
	'haganah-aura': powerup('Haganah Aura', '🛡️', 'haganah', 30, 35000, { armorBonus: 18 })
});

export function defaultShliachAttributes() {
	return Object.fromEntries(
		Object.keys(SHLIACH_ATTRIBUTES).map(attributeId => [attributeId, 1])
	);
}

export function deriveShliachStats(attributes, level = 1) {
	const values = normalizedAttributes(attributes);
	const total = Object.values(values).reduce((sum, value) => sum + value, 0);
	return {
		affinityMechanics: Object.freeze({
			binah: Object.freeze({
				burnDurationBonusMs: values.binah * 140,
				chargedAreaBonus: values.binah * 0.018
			}),
			chochmah: Object.freeze({
				projectileSpeedBonus: values.chochmah * 0.015,
				revealDurationBonusMs: values.chochmah * 120
			}),
			malchus: Object.freeze({
				guardDamageBonus: values.malchus * 0.02,
				poise: values.malchus * 2
			}),
			'zeir-anpin': Object.freeze({
				flowRecoveryBonus: values.zeirAnpin * 0.012,
				soakDurationBonusMs: values.zeirAnpin * 110
			})
		}),
		armor: values.haganah * 3,
		cooldownMultiplier: Math.max(0.6, 1 - values.binah * 0.03),
		daasInsightTier: insightTier(values.daas),
		damageBonus: values.gevurah * 2,
		focusMaximum: 20 + values.chochmah * 4,
		interruptForceBonus: values.gevurah * 1.5,
		powerRating: level * 10 + total * 5,
		trackingRange: 70 + values.daas * 15
	};
}

export function applyShliachPowerups(derived, activePowerups) {
	const result = structuredClone(derived);
	for (const powerupId of Object.keys(activePowerups)) {
		const effect = SHLIACH_POWERUPS[powerupId]?.effect || {};
		if (effect.focusBonus) result.focusMaximum += effect.focusBonus;
		if (effect.damageBonus) result.damageBonus += effect.damageBonus;
		if (effect.armorBonus) result.armor += effect.armorBonus;
		if (effect.trackingBonus) result.trackingRange += effect.trackingBonus;
		if (effect.cooldownMultiplier) result.cooldownMultiplier *= effect.cooldownMultiplier;
	}
	return result;
}

function normalizedAttributes(attributes = {}) {
	return Object.fromEntries(Object.keys(SHLIACH_ATTRIBUTES).map(key => [
		key,
		Math.max(0, Number(attributes[key] || 0))
	]));
}

function insightTier(daas) {
	if (daas >= 9) return 3;
	if (daas >= 6) return 2;
	if (daas >= 3) return 1;
	return 0;
}

function attribute(name, icon, effect, maximum) {
	return Object.freeze({ effect, icon, maximum, name });
}

function powerup(name, icon, attributeId, cost, durationMs, effect) {
	return Object.freeze({ attributeId, cost, durationMs, effect: Object.freeze(effect), icon, name });
}
