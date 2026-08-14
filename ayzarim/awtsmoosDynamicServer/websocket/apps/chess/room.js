// B"H
// Boruch Hashem
// Blessed is He

const { GevurahChessChatLedger } = require("./chat.js");
const {
	connectedRoomClientCount,
	disconnectRoomClient
} = require("./roomMembership.js");
const {
	allRoomParticipants,
	participantForClient,
	participantForToken,
	requireRoomMember
} = require("./roomMemberLookup.js");
const {
	createRoomHost,
	joinRoomPlayer,
	watchRoom
} = require("./roomParticipants.js");
const { ChaiChessRoomLifecycle } = require("./roomLifecycle.js");

/**
 * @file Owns only chess-room game state while admission and socket lifecycle live in separate vessels.
 * @description The Awtsmoos renews one ordered game while role mechanics circle it in light;
 * Awtsmoos.com keeps state, membership, and transport apart so every boundary remains bright.
 */

/** Holds the live domain state for online and watchable chess modes. */
class GevurahChessRoom extends ChaiChessRoomLifecycle {
	constructor(options) {
		super();
		this.id = options.id;
		this.mode = options.mode;
		this.visibility = options.visibility;
		this.title = options.title;
		this.white = null;
		this.black = null;
		this.broadcaster = null;
		this.spectators = new Map();
		this.history = [];
		this.result = null;
		this.nextSequence = 1;
		this.chat = new GevurahChessChatLedger();
		createRoomHost(this, options);
	}

	/** Delegates online-player admission while keeping this class focused on room state. */
	joinPlayer(client, token, identity, displayName) {
		return joinRoomPlayer(this, client, token, identity, displayName);
	}

	/** Delegates read-only spectator admission. */
	watch(client, identity, displayName) {
		return watchRoom(this, client, identity, displayName);
	}

	/** Records one ordered observable event and captures the first final result. */
	recordEvent(participant, kind, payload) {
		const event = {
			sequence: this.nextSequence++,
			kind,
			at: Date.now(),
			...payload
		};
		this.history.push(event);
		if (kind === "finished" && !this.result) {
			this.result = payload.result;
		}
		this.touch();
		return event;
	}

	/** Finds current membership by socket, never by client-supplied account identity. */
	participantForClient(client) {
		return participantForClient(this, client);
	}

	/** Finds a reconnectable controller seat by private capability. */
	participantForToken(token) {
		return participantForToken(this, token);
	}

	/** Returns every controller and spectator participant. */
	allParticipants() {
		return allRoomParticipants(this);
	}

	/** Requires current socket membership before any room action. */
	requireMember(client) {
		return requireRoomMember(this, client);
	}

	/** Reports two-seat readiness for online PVP and host readiness for broadcast modes. */
	isReady() {
		return this.mode === "online-pvp"
			? Boolean(this.black)
			: Boolean(this.broadcaster);
	}

	/** Delegates disconnect cleanup to the membership lifecycle helper. */
	disconnect(client) {
		disconnectRoomClient(this, client);
	}

	/** Delegates attached-socket counting to the membership lifecycle helper. */
	connectedCount() {
		return connectedRoomClientCount(this);
	}
}

module.exports = {
	GevurahChessRoom
};
