//B"H
//Boruch Hashem
//Blessed is He

/**
 * Roster mutations form a bounded vessel around player and spectator membership.
 * The Awtsmoos renews every participant; Awtsmoos.com checks role before phase so
 * a witness never receives player-state detail through a less precise rejection.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { LobbyPlayer } = require('./LobbyPlayer.js');
const { LobbySpectator } = require('./LobbySpectator.js');
const Policy = require('./LobbyRoomPolicy.js');
const { MAXIMUM_PLAYERS, MAXIMUM_SPECTATORS } = require('./SefiraLimits.js');

function addPlayer(room, client, profile, isOwner = false) {
	Policy.requireLobbyPhase(room);
	if (room.players.length >= MAXIMUM_PLAYERS) {
		throw new RealtimeError('LOBBY_FULL', 'This lobby already has four players.');
	}
	requireUniqueClient(room, client);
	const player = new LobbyPlayer(client, profile, isOwner);
	room.players.push(player);
	Policy.clearReadiness(room);
	room.touch();
	return player;
}

function addSpectator(room, client, profile) {
	if (room.spectators.length >= MAXIMUM_SPECTATORS) {
		throw new RealtimeError('SPECTATOR_FULL', 'This lobby already has eight spectators.');
	}
	requireUniqueClient(room, client);
	const spectator = new LobbySpectator(client, profile);
	room.spectators.push(spectator);
	room.touch();
	return spectator;
}

function updatePlayer(room, client, fields) {
	const player = Policy.requireMember(room, client);
	Policy.requireLobbyPhase(room);
	if (fields.characterId !== undefined || fields.team !== undefined) {
		fields.ready = false;
	}
	player.update(fields);
	room.touch();
	return player;
}

function suspendParticipant(room, participant) {
	if (participant.role === 'player') {
		room.match.suspend(participant.id);
	}
	room.touch();
}

function resumeParticipant(room, participant) {
	if (participant.role === 'player') {
		room.match.resume(participant.id);
	}
	room.touch();
}

function removeParticipant(room, participant) {
	if (participant.role === 'player') {
		room.match.disconnect(participant.id);
		room.players = room.players.filter(candidate => candidate !== participant);
		migrateOwnership(room, participant);
	} else {
		room.spectators = room.spectators.filter(candidate => candidate !== participant);
	}
	if (room.isEmpty()) {
		room.match.stopTimer();
	}
	room.touch();
	return participant;
}

function requireUniqueClient(room, client) {
	if (Policy.participantForClient(room, client)) {
		throw new RealtimeError('ALREADY_IN_LOBBY', 'Client is already in this lobby.');
	}
}

function migrateOwnership(room, departing) {
	if (departing.isOwner && room.players.length > 0) {
		room.players[0].isOwner = true;
	}
}

module.exports = {
	addPlayer,
	addSpectator,
	removeParticipant,
	resumeParticipant,
	suspendParticipant,
	updatePlayer
};
