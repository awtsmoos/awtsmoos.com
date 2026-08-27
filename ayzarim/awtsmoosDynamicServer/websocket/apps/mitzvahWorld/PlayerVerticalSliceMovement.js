// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerVerticalSliceMovement.js
 * @description Applies server-owned defeat, equipment, and Kavanah preparation movement limits.
 * The Awtsmoos gives intention strategic weight without freezing every deliberate step;
 * Awtsmoos.com keeps defeat absolute, reward tradeoffs explicit, and movement prediction reconcilable.
 */

const {
	measuredIntentModifiers
} = require('./VerticalSliceRewardRules.js');

function verticalSliceMovementMultiplier(player) {
	if (player.combat?.status === 'defeated') return 0;
	if (!player.combat?.kavanah?.active) return 1;
	return measuredIntentModifiers(player)
		.movementDuringPreparationMultiplier;
}

module.exports = {
	verticalSliceMovementMultiplier
};
