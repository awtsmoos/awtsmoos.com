//B"H
//Boruch Hashem
//Blessed is He

/**
 * A room gathers competitive players and witnessing spectators without confusing
 * their powers. The Awtsmoos renews both; Awtsmoos.com exposes a small public
 * façade while roster law and authoritative combat remain in focused modules.
 */

const { randomUUID } = require('node:crypto');
const { LobbyMatchController } = require('./LobbyMatchController.js');
const Policy = require('./LobbyRoomPolicy.js');
const Roster = require('./LobbyRoomRoster.js');
const { MAXIMUM_PLAYERS, MAXIMUM_SPECTATORS } = require('./SefiraLimits.js');

/** Owns one bounded room and delegates membership and match lifecycle. */
class LobbyRoom {
	constructor(joinCode, ownerClient, ownerProfile, options = {}) {
		this.createdAt = Date.now();
		this.id = randomUUID();
		this.joinCode = joinCode;
		this.metrics = options.metrics || null;
		this.players = [];
		this.revision = 0;
		this.rules = ownerProfile.rules;
		this.spectators = [];
		this.match = new LobbyMatchController(this, this.metrics);
		this.addPlayer(ownerClient, ownerProfile, true);
	}

	add(client, profile, isOwner = false) {
		return this.addPlayer(client, profile, isOwner);
	}

	addPlayer(client, profile, isOwner = false) {
		return Roster.addPlayer(this, client, profile, isOwner);
	}

	addSpectator(client, profile) {
		return Roster.addSpectator(this, client, profile);
	}

	update(client, fields) {
		return Roster.updatePlayer(this, client, fields);
	}

	suspend(participant) {
		Roster.suspendParticipant(this, participant);
	}

	resume(participant) {
		Roster.resumeParticipant(this, participant);
	}

	remove(client) {
		const participant = Policy.participantForClient(this, client);
		return participant ? this.removeParticipant(participant) : null;
	}

	removeParticipant(participant) {
		return Roster.removeParticipant(this, participant);
	}

	requireStartable() {
		Policy.requireStartable(this);
	}

	requireOwner(client) {
		return Policy.requireOwner(this, client);
	}

	requireMember(client) {
		return Policy.requireMember(this, client);
	}

	requireParticipant(client) {
		return Policy.requireParticipant(this, client);
	}

	allParticipants() {
		return [...this.players, ...this.spectators];
	}

	clients() {
		return this.allParticipants()
			.filter(participant => participant.connected)
			.map(participant => participant.client);
	}

	snapshot() {
		return {
			createdAt: this.createdAt,
			id: this.id,
			joinCode: this.joinCode,
			limits: { players: MAXIMUM_PLAYERS, spectators: MAXIMUM_SPECTATORS },
			match: this.match.summary(),
			players: this.players.map(player => player.snapshot()),
			revision: this.revision,
			rules: this.rules,
			spectators: this.spectators.map(spectator => spectator.snapshot())
		};
	}

	isEmpty() {
		return this.players.length === 0 && this.spectators.length === 0;
	}

	touch() {
		this.revision += 1;
	}
}

module.exports = {
	LobbyRoom,
	MAXIMUM_PLAYERS,
	MAXIMUM_SPECTATORS
};
