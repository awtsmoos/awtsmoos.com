// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerProfileRequest.js
 * @description Handles identity, private allocation, affinity loadouts, and timed powerups.
 * The Awtsmoos renews inner capacity without exposing its private accounting;
 * Awtsmoos.com preserves historic identity beside owner-only affinity truth and checkpointing.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const {
	boundedNumber,
	boundedText,
	commandPayload,
	identifier,
	oneOf
} = require('./CommandValidation.js');
const { RESPONSE_TYPES } = require('./protocol.js');
const { commandResult, queryResult } = require('./WorldCommandResult.js');

function handlePlayerProfileRequest(room, player, rawPayload) {
	const payload = commandPayload(rawPayload || {});
	const operation = oneOf(
		payload.operation || 'get',
		['activate', 'allocate', 'get', 'loadout', 'update'],
		'Profile operation'
	);
	if (operation === 'get') {
		return queryResult(RESPONSE_TYPES.PLAYER_PROFILE, profileSnapshot(room, player));
	}
	if (operation === 'update') return updateIdentity(room, player, payload);
	const shliach = applyPrivateOperation(room, player, payload, operation);
	return commandResult(
		RESPONSE_TYPES.PLAYER_PROFILE,
		{
			...room.playerActions.profile(player, null),
			shliach
		},
		{ broadcast: false, checkpoint: true }
	);
}

function applyPrivateOperation(room, player, payload, operation) {
	if (operation === 'allocate') {
		return room.profiles.allocate(
			player,
			identifier(payload.attributeId, 'Attribute id'),
			boundedNumber(payload.points ?? 1, 'Attribute points', 1, 5)
		);
	}
	if (operation === 'loadout') {
		return room.profiles.loadout(
			player,
			identifier(payload.affinityId, 'Affinity id'),
			loadoutActionIds(payload.actionIds)
		);
	}
	return room.profiles.activate(
		player,
		identifier(payload.powerupId, 'Powerup id')
	);
}

function updateIdentity(room, player, payload) {
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

function loadoutActionIds(value) {
	if (!Array.isArray(value) || value.length > 8) {
		throw new RealtimeError(
			'INVALID_AFFINITY_LOADOUT',
			'Affinity loadout actions must be an array with at most eight entries.'
		);
	}
	return value.map(actionId => identifier(actionId, 'Combat action id'));
}

function profileSnapshot(room, player) {
	return {
		...room.playerActions.profile(player, null),
		shliach: room.profiles.snapshot(player)
	};
}

module.exports = { handlePlayerProfileRequest };
