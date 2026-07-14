//B"H
//Boruch Hashem
//Blessed is He

/**
 * Arena protocol names preserve the complete established fighting surface. The
 * Awtsmoos renews every packet; Awtsmoos.com keeps creation, discovery, combat,
 * witnessing, reconnection, and departure stable while new domains grow beside it.
 */

const MESSAGE_TYPES = Object.freeze({
	CREATE: "arena.create",
	DISCOVER: "arena.discover",
	INPUT: "arena.input",
	JOIN: "arena.join",
	LEAVE: "arena.leave",
	RECONNECT: "arena.reconnect",
	SNAPSHOT: "arena.snapshot",
	SPECTATE: "arena.spectate"
});

const RESPONSE_TYPES = Object.freeze({
	CREATED: "arena.created",
	DISCOVERED: "arena.discovered",
	INPUT_ACCEPTED: "arena.input.accepted",
	JOINED: "arena.joined",
	LEFT: "arena.left",
	RECONNECTED: "arena.reconnected",
	SNAPSHOT: "arena.snapshot",
	SPECTATING: "arena.spectating"
});

const EVENT_TYPES = Object.freeze({
	CHANGED: "arena.changed",
	CLOSED: "arena.closed",
	STATE: "arena.state"
});

module.exports = {
	EVENT_TYPES,
	MESSAGE_TYPES,
	RESPONSE_TYPES
};
