// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerProfileRequest.js
 * @description Handles identity, private Shliach allocation, and timed powerup operations.
 * The Awtsmoos renews inner capacity without exposing its private accounting;
 * Awtsmoos.com preserves the historic identity envelope beside owner-only Shliach truth.
 */

const {
	boundedNumber,
	boundedText,
	commandPayload,
	identifier,
	oneOf
} = require('./CommandValidation.js');
const { RESPONSE_TYPES } = require('./protocol.js');
const {
	commandResult,
	queryResult
} = require('./WorldCommandResult.js');

function handlePlayerProfileRequest(room, player, rawPayload) {
	const payload = commandPayload(rawPayload || {});
	const operation = oneOf(
		payload.operation || 'get',
		['activate', 'allocate', 'get', 'update'],
		'Profile operation'
	);
	if (operation === 'get') {
		return queryResult(
			RESPONSE_TYPES.PLAYER_PROFILE,
			profileSnapshot(room, player)
		);
	}
	if (operation === 'update') {
		const identity = room.playerActions.profile(player, {
			status: boundedText(payload.status, 'Status', 16)
		});
		room.record('player.updated', { playerId: player.id });
		return commandResult(
			RESPONSE_TYPES.PLAYER_PROFILE,
			{
				...identity,
				shliach: room.profiles.snapshot(player)
			},
			{ broadcast: true }
		);
	}
	const shliach = operation === 'allocate'
		? room.profiles.allocate(
			player,
			identifier(payload.attributeId, 'Attribute id'),
			boundedNumber(payload.points ?? 1, 'Attribute points', 1, 5)
		)
		: room.profiles.activate(
			player,
			identifier(payload.powerupId, 'Powerup id')
		);
	return commandResult(
		RESPONSE_TYPES.PLAYER_PROFILE,
		{
			...room.playerActions.profile(player, null),
			shliach
		},
		{ broadcast: false, checkpoint: true }
	);
}

function profileSnapshot(room, player) {
	return {
		...room.playerActions.profile(player, null),
		shliach: room.profiles.snapshot(player)
	};
}

module.exports = {
	handlePlayerProfileRequest
};
