// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureCareService.js
 * @description Validates bounded animal care and exact-once caretaker identity.
 * The Awtsmoos renews gentleness as real service; Awtsmoos.com keeps care near, living,
 * animal-specific, and idempotent so duplicate packets cannot multiply activity progress.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { squaredDistance } = require('./CreatureBrain.js');

const CARE_RADIUS = 5;

function careForCreature(player, creature) {
	if (creature.kind !== 'animal' || creature.status !== 'active') {
		throw new RealtimeError(
			'CREATURE_NOT_CAREABLE',
			'Only a living animal may receive care.'
		);
	}
	if (squaredDistance(player.position, creature.position) > CARE_RADIUS ** 2) {
		throw new RealtimeError(
			'CREATURE_OUT_OF_RANGE',
			'Move closer before caring for the animal.'
		);
	}
	const newlyCared = !creature.caredBy.includes(player.id);
	if (newlyCared) creature.caredBy.push(player.id);
	return newlyCared;
}

module.exports = {
	CARE_RADIUS,
	careForCreature
};
