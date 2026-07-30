// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerAttributeCatalog.js
 * @description Joins bounded Shliach attributes with canonical equipment and affinity mechanics.
 * The Awtsmoos renews every finite vessel while no single stat becomes universal might;
 * Awtsmoos.com keeps movement, guard, affinity, insight, interruption, and power in typed light.
 */

const { playerDerivedStatSources } = require('./PlayerDerivedStatSources.js');
const { projectServerDerivedStats } = require('./ServerDerivedStatProjector.js');

const ATTRIBUTE_CATALOG = Object.freeze({
	binah: attribute('Binah', '🔥', 'Burn duration and charged area', 10),
	chochmah: attribute('Chochmah', '✨', 'Projectile speed and revelation', 10),
	daas: attribute('Daas', '🧭', 'Tracking and combat insight', 10),
	gevurah: attribute('Gevurah', '⚔️', 'Damage and interrupt force', 10),
	haganah: attribute('Haganah', '🛡️', 'Armor and guard', 10),
	malchus: attribute('Malchus', '🜃', 'Poise and guard damage', 10),
	zeirAnpin: attribute('Zeir Anpin', '💧', 'Flow recovery and soak duration', 10)
});

function createPlayerAttributes(source = {}) {
	return Object.fromEntries(Object.entries(ATTRIBUTE_CATALOG).map(([id, definition]) => {
		const value = Number(source[id]);
		return [id, Number.isFinite(value) ? clamp(value, 0, definition.maximum) : 1];
	}));
}

function derivedPlayerStats(player) {
	const attributes = createPlayerAttributes(player.shliach?.attributes);
	const equipment = projectServerDerivedStats(playerDerivedStatSources(player));
	const values = equipment.values;
	const protection = attributes.haganah;
	const level = Number(player.progression?.level || player.shliach?.level || 1);
	return {
		...values,
		affinityMechanics: affinityMechanics(attributes),
		areaResistance: clamp(values.areaResistance + protection * 0.012, 0, 0.85),
		armor: protection * 3,
		blockStrength: clamp(0.45 + values.blockStrength + protection * 0.03, 0, 0.9),
		cooldownMultiplier: Math.max(0.45, 1 - values.cooldownReduction - attributes.binah * 0.03),
		daasInsightTier: insightTier(attributes.daas),
		damageBonus: values.baseDamage + attributes.gevurah * 2,
		diagnostics: equipment,
		focusMaximum: 20 + values.maxFocus + attributes.chochmah * 4,
		guardStamina: 80 + values.guardStamina + protection * 10,
		interruptForceBonus: attributes.gevurah * 1.5,
		movementMultiplier: Math.max(0.4, 1 + values.movementSpeed),
		physicalResistance: clamp(values.physicalResistance + protection * 0.025, 0, 0.85),
		powerRating: level * 10 + attributeTotal(attributes) * 5 + equipmentPower(values),
		rangedResistance: clamp(values.rangedResistance + protection * 0.018, 0, 0.85),
		spiritualResistance: clamp(values.spiritualResistance + attributes.chochmah * 0.02, 0, 0.85),
		trackingRange: 70 + attributes.daas * 15
	};
}

function affinityMechanics(attributes) {
	return Object.freeze({
		binah: Object.freeze({
			burnDurationBonusMs: attributes.binah * 140,
			chargedAreaBonus: attributes.binah * 0.018
		}),
		chochmah: Object.freeze({
			projectileSpeedBonus: attributes.chochmah * 0.015,
			revealDurationBonusMs: attributes.chochmah * 120
		}),
		malchus: Object.freeze({
			guardDamageBonus: attributes.malchus * 0.02,
			poise: attributes.malchus * 2
		}),
		'zeir-anpin': Object.freeze({
			flowRecoveryBonus: attributes.zeirAnpin * 0.012,
			soakDurationBonusMs: attributes.zeirAnpin * 110
		})
	});
}

function attributeDefinition(attributeId) {
	return ATTRIBUTE_CATALOG[attributeId] || null;
}

function equipmentPower(values) {
	return Math.round(values.baseDamage + values.guardStamina * 0.2 + values.maxHealth * 0.4 + values.maxFocus * 0.5);
}

function attributeTotal(attributes) {
	return Object.values(attributes).reduce((total, value) => total + Number(value || 0), 0);
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

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number(value) || 0));
}

module.exports = {
	ATTRIBUTE_CATALOG,
	attributeDefinition,
	createPlayerAttributes,
	derivedPlayerStats
};
