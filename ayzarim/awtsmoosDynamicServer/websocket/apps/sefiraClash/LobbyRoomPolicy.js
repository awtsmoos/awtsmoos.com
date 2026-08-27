//B"H
//Boruch Hashem
//Blessed is He

/**
 * Membership law separates competitive players from witnessing spectators. The
 * Awtsmoos renews every relation; Awtsmoos.com requires connected ready fighters
 * while allowing spectators to receive the world without altering its outcome.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');

function requireLobbyPhase(room) {
	if (room.match.summary().phase !== 'lobby') {
		throw new RealtimeError('LOBBY_LOCKED', 'Lobby changes wait until rematch.');
	}
}

function requireMember(room, client) {
	const player = memberForClient(room, client);
	if (!player) {
		throw new RealtimeError('PLAYER_REQUIRED', 'This action requires a lobby player.');
	}
	return player;
}

function requireParticipant(room, client) {
	const participant = participantForClient(room, client);
	if (!participant) {
		throw new RealtimeError('NOT_IN_LOBBY', 'Client has no active Sefira lobby.');
	}
	return participant;
}

function requireOwner(room, client) {
	const member = requireMember(room, client);
	if (!member.isOwner) {
		throw new RealtimeError('OWNER_REQUIRED', 'Only the lobby owner may do that.');
	}
	return member;
}

function requireStartable(room) {
	requireLobbyPhase(room);
	if (room.players.length < 2) {
		throw new RealtimeError('NOT_ENOUGH_PLAYERS', 'At least two players are required.');
	}
	if (!room.players.every(player => player.connected)) {
		throw new RealtimeError('PLAYER_DISCONNECTED', 'Every player must be connected.');
	}
	if (!room.players.every(player => player.ready)) {
		throw new RealtimeError('PLAYERS_NOT_READY', 'Every player must be ready.');
	}
	if (room.rules.teams && uniqueTeams(room).size < 2) {
		throw new RealtimeError('TEAMS_REQUIRED', 'Team battle requires at least two teams.');
	}
}

function memberForClient(room, client) {
	return room.players.find(player => player.client === client) || null;
}

function participantForClient(room, client) {
	return room.allParticipants().find(participant => participant.client === client) || null;
}

function clearReadiness(room) {
	for (const player of room.players) {
		player.ready = false;
	}
}

function uniqueTeams(room) {
	return new Set(room.players.map(player => player.team));
}

module.exports = {
	clearReadiness,
	memberForClient,
	participantForClient,
	requireLobbyPhase,
	requireMember,
	requireOwner,
	requireParticipant,
	requireStartable
};
