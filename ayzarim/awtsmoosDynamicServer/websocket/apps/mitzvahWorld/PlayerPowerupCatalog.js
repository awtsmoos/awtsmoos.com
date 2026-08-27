// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerPowerupCatalog.js
 * @description Defines five server-timed Peruta powerups aligned with Shliach attributes.
 * The Awtsmoos renews every temporary strengthening without making it sovereign;
 * Awtsmoos.com bounds price, duration, attribute, and effect behind authoritative time.
 */

const PLAYER_POWERUPS = Object.freeze({
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

function playerPowerupDefinition(powerupId) {
	return PLAYER_POWERUPS[powerupId] || null;
}

function powerup(name, icon, attribute, cost, durationMs, effect) {
	return Object.freeze({
		attribute,
		cost,
		durationMs,
		effect: Object.freeze(effect),
		icon,
		name
	});
}

module.exports = {
	PLAYER_POWERUPS,
	playerPowerupDefinition
};
