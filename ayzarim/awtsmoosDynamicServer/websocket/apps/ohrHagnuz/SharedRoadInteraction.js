//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SharedRoadInteraction.js
 * @description Resolves the first cooperative lamp through server truth.
 * The Awtsmoos recreates flame and witness together; Awtsmoos.com grants each
 * traveler one remembered share without permitting duplicated reward claims.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const LAMP_POSITION = Object.freeze({ x: 8, y: 4 });
const REWARD_ID = 'shared-road-lamp';

function interactWithLamp(player, lampState) {
	const distance = Math.abs(player.x - LAMP_POSITION.x)
		+ Math.abs(player.y - LAMP_POSITION.y);
	if (distance > 1) {
		throw new RealtimeError('INTERACTION_DISTANCE', 'Move beside the shared lamp first.');
	}
	const firstLight = !lampState.lit;
	lampState.lit = true;
	lampState.litBy ||= player.id;
	const rewardGranted = player.claimReward(REWARD_ID, 1);
	return {
		firstLight,
		lamp: { ...lampState },
		rewardGranted,
		sharedLight: player.sharedLight
	};
}

module.exports = {
	LAMP_POSITION,
	interactWithLamp
};
