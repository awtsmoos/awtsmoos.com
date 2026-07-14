//B"H
//Boruch Hashem
//Blessed is He

/**
 * Cooperative membership owns create, join, resume, leave, and disconnect transitions.
 * The Awtsmoos renews every gathering beyond socket continuity; Awtsmoos.com keeps
 * join codes public, resume tokens private, and expired suspended players removable.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { createJoinCode } = require('./joinCode.js');
const { CoopRoom } = require('./CoopRoom.js');
const { EXPEDITION_SERVER_CATALOG } = require('./ExpeditionServerCatalog.js');

function createCoopRoom(directory, client, payload = {}) {
	assertFreeClient(directory, client);
	const locationId = validLocation(payload.locationId);
	const joinCode = createJoinCode(new Set(directory.roomsByCode.keys()));
	const room = new CoopRoom(joinCode, client, payload, {
		locationId,
		weatherClock: payload.weatherClock,
		metrics: directory.metrics
	});
	directory.roomsByCode.set(joinCode, room);
	const player = room.players[0];
	directory.sessions.bind(client, room, player);
	directory.metrics?.increment('coopRoomsCreated');
	return response(room, player);
}

function joinCoopRoom(directory, client, payload = {}) {
	assertFreeClient(directory, client);
	const joinCode = String(payload.joinCode || '')
		.trim()
		.toUpperCase();
	const room = directory.roomsByCode.get(joinCode);
	if (!room) throw new RealtimeError('COOP_ROOM_NOT_FOUND', 'Cooperative room was not found.');
	const player = room.add(client, payload);
	directory.sessions.bind(client, room, player);
	directory.metrics?.increment('coopPlayersJoined');
	return response(room, player);
}

function resumeCoopRoom(directory, client, payload = {}) {
	assertFreeClient(directory, client);
	const session = directory.sessions.resume(client, payload.resumeToken);
	session.room.changed();
	directory.metrics?.increment('coopSessionsResumed');
	return response(session.room, session.player);
}

function leaveCoopRoom(directory, client) {
	const session = directory.sessions.require(client);
	directory.sessions.remove(session);
	session.room.remove(session.player);
	cleanupRoom(directory, session.room);
	directory.metrics?.increment('coopPlayersLeft');
	return { left: true, joinCode: session.room.joinCode };
}

function disconnectCoopRoom(directory, client) {
	const session = directory.sessions.suspend(client, expired =>
		expireSession(directory, expired)
	);
	if (!session) return null;
	session.room.changed();
	directory.metrics?.increment('coopSessionsSuspended');
	return session.room.snapshot();
}

function expireSession(directory, session) {
	directory.sessions.remove(session);
	session.room.remove(session.player);
	cleanupRoom(directory, session.room);
	directory.metrics?.increment('coopSessionsExpired');
}

function cleanupRoom(directory, room) {
	if (!room.players.length) directory.roomsByCode.delete(room.joinCode);
}

function response(room, player) {
	return {
		coop: room.snapshot(),
		playerId: player.id,
		resumeToken: player.resumeToken
	};
}

function assertFreeClient(directory, client) {
	if (directory.sessions.sessionsByClient.has(client)) {
		throw new RealtimeError(
			'COOP_ALREADY_JOINED',
			'Client already belongs to a cooperative room.'
		);
	}
}

function validLocation(locationId) {
	const value = String(locationId || 'crown-ruins');
	if (!EXPEDITION_SERVER_CATALOG.locations.has(value)) {
		throw new RealtimeError('INVALID_COOP_LOCATION', 'Cooperative location is invalid.');
	}
	return value;
}

module.exports = {
	createCoopRoom,
	disconnectCoopRoom,
	joinCoopRoom,
	leaveCoopRoom,
	resumeCoopRoom
};
