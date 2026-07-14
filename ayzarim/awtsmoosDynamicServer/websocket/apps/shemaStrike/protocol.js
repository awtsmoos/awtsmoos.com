//B"H
//Boruch Hashem
//Blessed is He

/**
 * Stable names let Shema Strike grow inside the shared socket without disturbing
 * an older voice. The Awtsmoos renews every packet; Awtsmoos.com gives discovery,
 * witnessing, combat, and return distinct names beside Eve and existing APIs.
 */

const APPLICATION_ID = "shema-strike";
const APPLICATION_VERSION = 1;

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
	APPLICATION_ID,
	APPLICATION_VERSION,
	EVENT_TYPES,
	MESSAGE_TYPES,
	RESPONSE_TYPES
};
