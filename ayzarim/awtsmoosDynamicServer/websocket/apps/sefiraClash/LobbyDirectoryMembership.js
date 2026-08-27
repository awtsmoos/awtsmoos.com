//B"H
//Boruch Hashem
//Blessed is He

/**
 * Membership transitions reveal how one participant enters, pauses, resumes, and
 * departs a room. The Awtsmoos renews identity beyond transport; Awtsmoos.com keeps
 * each transition explicit so grace never masquerades as permanent departure.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { broadcastLobby } = require('./LobbyBroadcast.js');
const Policy = require('./LobbyDirectoryPolicy.js');
const { createJoinCode } = require('./joinCode.js');
const { LobbyRoom } = require('./LobbyRoom.js');

function createPlayer(directory, client, profile) {
	directory.sessions.requireAvailable(client);
	const code = createJoinCode(directory.roomsByCode);
	const room = new LobbyRoom(code, client, profile, { metrics: directory.metrics });
	const player = room.players[0];
	directory.roomsByCode.set(code, room);
	directory.sessions.register(client, room, player);
	directory.metrics.increment('roomsCreated');
	directory.metrics.increment('playersJoined');
	broadcastLobby(room);
	return Policy.sessionResult(room, player);
}

function joinPlayer(directory, client, profile) {
	const room = requireRoomCode(directory, profile.joinCode);
	directory.sessions.requireAvailable(client);
	const player = room.addPlayer(client, profile);
	directory.sessions.register(client, room, player);
	directory.metrics.increment('playersJoined');
	broadcastLobby(room);
	return Policy.sessionResult(room, player);
}

function watchRoom(directory, client, profile) {
	const room = requireRoomCode(directory, profile.joinCode);
	directory.sessions.requireAvailable(client);
	const spectator = room.addSpectator(client, profile);
	directory.sessions.register(client, room, spectator);
	directory.metrics.increment('spectatorsJoined');
	broadcastLobby(room);
	return Policy.sessionResult(room, spectator);
}

function resumeSession(directory, client, token) {
	const session = directory.sessions.resume(client, token);
	session.room.resume(session.participant);
	directory.metrics.increment('sessionsResumed');
	broadcastLobby(session.room);
	session.room.match.broadcastCurrent();
	return Policy.sessionResult(session.room, session.participant);
}

function leaveSession(directory, client) {
	const session = directory.sessions.sessionForClient(client);
	if (!session) {
		return null;
	}
	directory.sessions.release(session.participant);
	return finalizeRemoval(directory, session, 'intentionalLeaves');
}

function suspendSession(directory, client) {
	const session = directory.sessions.suspend(client);
	if (!session) {
		return null;
	}
	session.room.suspend(session.participant);
	directory.metrics.increment('sessionsSuspended');
	broadcastLobby(session.room);
	session.room.match.broadcastCurrent();
	directory.sessions.scheduleExpiry(session, expired => expireSession(directory, expired));
	return session.room.snapshot();
}

function expireSession(directory, session) {
	if (session.participant.connected) {
		return;
	}
	directory.sessions.release(session.participant);
	finalizeRemoval(directory, session, 'sessionsExpired');
}

function finalizeRemoval(directory, session, metricName) {
	const room = session.room;
	room.removeParticipant(session.participant);
	directory.metrics.increment(metricName);
	if (room.isEmpty()) {
		directory.roomsByCode.delete(room.joinCode);
		directory.metrics.increment('roomsDestroyed');
		return null;
	}
	broadcastLobby(room);
	return room.snapshot();
}

function requireRoomCode(directory, joinCode) {
	const room = directory.roomsByCode.get(joinCode);
	if (!room) {
		throw new RealtimeError('LOBBY_NOT_FOUND', 'No lobby matches that join code.');
	}
	return room;
}

module.exports = {
	createPlayer,
	expireSession,
	joinPlayer,
	leaveSession,
	resumeSession,
	suspendSession,
	watchRoom
};
