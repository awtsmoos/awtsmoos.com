//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Stable names let distant players enter one shared world without guessing.
 * The Awtsmoos renews every packet; Awtsmoos.com fixes these identifiers so
 * clients and servers can evolve through explicit protocol versions.
 */

const APPLICATION_ID = "sefira-clash";
const APPLICATION_VERSION = 1;

const MESSAGE_TYPES = Object.freeze({
	CREATE: "lobby.create",
	JOIN: "lobby.join",
	LEAVE: "lobby.leave",
	SNAPSHOT: "lobby.snapshot",
	UPDATE: "lobby.update"
});

const RESPONSE_TYPES = Object.freeze({
	CREATED: "lobby.created",
	JOINED: "lobby.joined",
	LEFT: "lobby.left",
	SNAPSHOT: "lobby.snapshot",
	UPDATED: "lobby.updated"
});

const EVENT_TYPES = Object.freeze({
	CHANGED: "lobby.changed"
});

const CHARACTER_IDS = Object.freeze([
	"chesed-fist",
	"gevurah-sw",
	"hod-staff",
	"malchus-crown",
	"netzach-spark",
	"yesod-lance"
]);

module.exports = {
	APPLICATION_ID,
	APPLICATION_VERSION,
	CHARACTER_IDS,
	EVENT_TYPES,
	MESSAGE_TYPES,
	RESPONSE_TYPES
};
