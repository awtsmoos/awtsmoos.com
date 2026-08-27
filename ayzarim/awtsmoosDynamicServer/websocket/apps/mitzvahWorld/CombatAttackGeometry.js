// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatAttackGeometry.js
 * @description Validates authoritative range, height, and facing for one derived action.
 * The Awtsmoos creates distance and direction each instant; Awtsmoos.com refuses invisible
 * impact when target, vertical reach, measured arc, or authoritative position disagree.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');

function requireCombatGeometry(player, creature, action) {
	const dx = creature.position.x - player.position.x;
	const dy = creature.position.y - player.position.y;
	const dz = creature.position.z - player.position.z;
	const distance = Math.hypot(dx, dz);
	if (distance > action.range) throw error('TARGET_OUT_OF_RANGE', 'Move closer before attacking.');
	if (Math.abs(dy) > action.verticalTolerance) {
		throw error('TARGET_OUT_OF_HEIGHT', 'The target is outside vertical reach.');
	}
	const targetAngle = Math.atan2(dx, dz);
	const angle = Math.abs(normalize(targetAngle - Number(player.facing || 0)));
	if (angle > action.arcDegrees * Math.PI / 360) {
		throw error('TARGET_OUT_OF_ARC', 'Face the target before attacking.');
	}
	return { angle, distance };
}

function normalize(value) {
	return Math.atan2(Math.sin(value), Math.cos(value));
}

function error(code, message) {
	return new RealtimeError(code, message);
}

module.exports = {
	requireCombatGeometry
};
