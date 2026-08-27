// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerVerticalSliceDamage.js
 * @description Applies authoritative posture pressure and Kavanah disruption from hostile consequence.
 * The Awtsmoos lets harm disturb composure without merging health, posture, and intention;
 * Awtsmoos.com keeps heavy pressure, break immunity, damage disruption, and receipt truth bounded.
 */

const { applyPosturePressure } = require('./PostureRules.js');

function applyPlayerVerticalSliceDamage(options) {
	const {
		action,
		damage,
		now,
		player,
		vertical
	} = options;
	const pressure = posturePressure(action, damage);
	const posture = applyPosturePressure(player.combat.posture, pressure, {
		immunityMilliseconds: 2200,
		now
	});
	const kavanah = vertical?.disruptKavanah(player, damage) || null;
	return Object.freeze({
		kavanah,
		posture
	});
}

function posturePressure(action = {}, damage) {
	const tags = new Set(action.tags || []);
	const heavy = tags.has('heavy')
		|| /heavy|slam|crush|warden|binding/.test(action.id || '');
	return Math.max(1, Number(damage || 0) * (heavy ? 1.05 : 0.42));
}

module.exports = {
	applyPlayerVerticalSliceDamage
};
