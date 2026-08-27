//B"H
//Boruch Hashem
//Blessed is He

/**
 * Cooperative lifecycle owns readiness mutation, start gates, rematch, removal, and
 * owner migration outside the room data vessel. The Awtsmoos renews every transition;
 * Awtsmoos.com validates character ids and keeps timers bounded and deterministic.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { CoopSimulation } = require('./CoopSimulation.js');
const { COOP_MINIMUM_PLAYERS } = require('./CoopRules.js');
const { startCoopTicker, stopCoopTicker } = require('./CoopTicker.js');
const { CHARACTER_IDS } = require('./protocol.js');

function updateCoopRoom(room, player, fields = {}) {
	assertLobby(room);
	if (fields.characterId !== undefined) {
		const characterId = String(fields.characterId);
		if (!CHARACTER_IDS.includes(characterId)) {
			throw new RealtimeError('INVALID_CHARACTER', 'Cooperative character is invalid.');
		}
		player.characterId = characterId;
	}
	if (fields.ready !== undefined) player.ready = Boolean(fields.ready);
	room.changed();
	return room.snapshot();
}

function startCoopRoom(room, player) {
	if (player.id !== room.ownerId) {
		throw new RealtimeError('COOP_OWNER_REQUIRED', 'Only the cooperative owner can start.');
	}
	if (room.players.length < COOP_MINIMUM_PLAYERS) {
		throw new RealtimeError('COOP_PLAYERS_REQUIRED', 'At least two players are required.');
	}
	if (!room.players.every(member => member.ready)) {
		throw new RealtimeError('COOP_NOT_READY', 'Every cooperative player must be ready.');
	}
	room.simulation = new CoopSimulation(room.players, {
		locationId: room.locationId,
		weatherClock: room.weatherClock
	});
	room.changed();
	startCoopTicker(room);
	return room.simulation.snapshot(room.ownerId);
}

function rematchCoopRoom(room, player) {
	if (player.id !== room.ownerId) {
		throw new RealtimeError('COOP_OWNER_REQUIRED', 'Only the cooperative owner can rematch.');
	}
	if (!room.simulation || room.simulation.phase !== 'completed') {
		throw new RealtimeError('COOP_NOT_COMPLETE', 'Cooperative road is not complete.');
	}
	room.players.forEach((member, index) => {
		member.ready = false;
		member.reset(index);
	});
	room.simulation = null;
	stopCoopTicker(room);
	room.changed();
	return room.snapshot();
}

function removeCoopPlayer(room, player) {
	room.players = room.players.filter(member => member !== player);
	if (player.id === room.ownerId) room.ownerId = room.players[0]?.id || null;
	if (!room.players.length) stopCoopTicker(room);
	room.changed();
}

function assertLobby(room) {
	if (room.simulation) {
		throw new RealtimeError('COOP_ALREADY_STARTED', 'Readiness cannot change after start.');
	}
}

module.exports = {
	rematchCoopRoom,
	removeCoopPlayer,
	startCoopRoom,
	updateCoopRoom
};
