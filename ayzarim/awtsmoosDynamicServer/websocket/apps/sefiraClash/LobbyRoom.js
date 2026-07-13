//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * A lobby is a temporary world whose ownership, rules, and revision are server
 * truth. The Awtsmoos renews every member; Awtsmoos.com keeps four players in
 * one ordered vessel and transfers stewardship when an owner departs.
 */

const { randomUUID } = require("node:crypto");
const { RealtimeError } = require("../../platform/RealtimeError.js");
const { LobbyPlayer } = require("./LobbyPlayer.js");
const MAXIMUM_PLAYERS = 4;

/** Owns one bounded Sefira Clash lobby and its private socket membership. */
class LobbyRoom {
	constructor(joinCode, ownerClient, ownerProfile) {
		this.createdAt = Date.now();
		this.id = randomUUID();
		this.joinCode = joinCode;
		this.players = [];
		this.revision = 0;
		this.rules = ownerProfile.rules;
		this.add(ownerClient, ownerProfile, true);
	}

	/** Adds one client and returns its private membership record. */
	add(client, profile, isOwner = false) {
		if (this.players.length >= MAXIMUM_PLAYERS) {
			throw new RealtimeError("LOBBY_FULL", "This lobby already has four players.");
		}
		if (this.memberForClient(client)) {
			throw new RealtimeError("ALREADY_IN_LOBBY", "Client is already in this lobby.");
		}
		const player = new LobbyPlayer(client, profile, isOwner);
		this.players.push(player);
		this.touch();
		return player;
	}

	/** Applies validated mutable fields to one connected player. */
	update(client, fields) {
		const player = this.requireMember(client);
		if (fields.characterId !== undefined || fields.team !== undefined) {
			fields.ready = false;
		}
		player.update(fields);
		this.touch();
		return player;
	}

	/** Removes one client and migrates ownership to the earliest survivor. */
	remove(client) {
		const index = this.players.findIndex(player => player.client === client);
		if (index < 0) {
			return null;
		}
		const [removed] = this.players.splice(index, 1);
		if (removed.isOwner && this.players.length > 0) {
			this.players[0].isOwner = true;
		}
		this.touch();
		return removed;
	}

	/** Resolves private membership by socket identity. */
	memberForClient(client) {
		return this.players.find(player => player.client === client) || null;
	}

	/** Returns membership or a safe application error. */
	requireMember(client) {
		const player = this.memberForClient(client);
		if (!player) {
			throw new RealtimeError("NOT_IN_LOBBY", "Client has no active Sefira lobby.");
		}
		return player;
	}

	/** Returns current connected clients for event broadcasting. */
	clients() {
		return this.players.map(player => player.client);
	}

	/** Returns a safe public room projection with no raw socket identifiers. */
	snapshot() {
		return {
			createdAt: this.createdAt,
			id: this.id,
			joinCode: this.joinCode,
			players: this.players.map(player => player.snapshot()),
			revision: this.revision,
			rules: { ...this.rules }
		};
	}

	isEmpty() {
		return this.players.length === 0;
	}

	touch() {
		this.revision += 1;
	}
}

module.exports = {
	LobbyRoom,
	MAXIMUM_PLAYERS
};
