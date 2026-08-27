//B"H
//Boruch Hashem
//Blessed is He

/**
 * Membership is Tiferes joining capacity, role, ownership, and cleanup without
 * confusing them with simulation. The Awtsmoos renews every participant;
 * Awtsmoos.com guards who may fight, who may witness, and who inherits ownership.
 */

const { RealtimeError } = require("../../../platform/RealtimeError.js");
const { ArenaFighter } = require("../ArenaFighter.js");
const { ArenaSpectator } = require("./ArenaSpectator.js");

function addFighter(room, client, name, isOwner = false) {
	if (room.fighters.length >= room.settings.maximumPlayers) {
		throw new RealtimeError("ARENA_FULL", "This arena has no fighter slot available.");
	}
	requireUniqueClient(room, client);
	if (!room.settings.lateJoin && room.simulation.phase !== "waiting") {
		throw new RealtimeError("LATE_JOIN_DISABLED", "This arena no longer accepts fighters.");
	}
	const fighter = new ArenaFighter(client, name, room.fighters.length, isOwner);
	room.simulation.add(fighter);
	room.touch();
	return fighter;
}

function addSpectator(room, client, name) {
	if (room.spectators.length >= room.settings.maximumSpectators) {
		throw new RealtimeError("SPECTATOR_FULL", "This arena has no spectator slot available.");
	}
	requireUniqueClient(room, client);
	const spectator = new ArenaSpectator(client, name);
	room.spectators.push(spectator);
	room.touch();
	return spectator;
}

function removeParticipant(room, participant) {
	if (participant.role === "fighter") {
		room.simulation.remove(participant.id);
		room.botDirector.release(participant.id);
		migrateOwnership(room, participant);
	} else {
		room.spectators = room.spectators.filter((candidate) => candidate !== participant);
	}
	room.touch();
	return participant;
}

function participantForClient(room, client) {
	return [...room.fighters, ...room.spectators]
		.find((participant) => participant.client === client) ?? null;
}

function owner(room) {
	return room.fighters.find((fighter) => fighter.isOwner) ?? null;
}

function joinableRoles(room) {
	const roles = [];
	if (room.fighters.length < room.settings.maximumPlayers
		&& (room.settings.lateJoin || room.simulation.phase === "waiting")) {
		roles.push("fighter");
	}
	if (room.spectators.length < room.settings.maximumSpectators) {
		roles.push("spectator");
	}
	return roles;
}

function requireUniqueClient(room, client) {
	if (participantForClient(room, client)) {
		throw new RealtimeError("ALREADY_IN_ARENA", "Client is already in this arena.");
	}
}

function migrateOwnership(room, departing) {
	if (!departing.isOwner) {
		return;
	}
	const successor = room.fighters.find((fighter) => !fighter.isBot && fighter !== departing);
	if (successor) {
		successor.isOwner = true;
	}
}

module.exports = {
	addFighter,
	addSpectator,
	joinableRoles,
	owner,
	participantForClient,
	removeParticipant
};
