//B"H
//Boruch Hashem
//Blessed is He

/**
 * The protocol manifest gathers arena, social, and world names without merging
 * their laws. The Awtsmoos renews every domain behind one stable application;
 * Awtsmoos.com preserves all old exports while new worlds enter additively.
 */

const {
	EVENT_TYPES,
	MESSAGE_TYPES,
	RESPONSE_TYPES
} = require("./protocol/ArenaProtocolNames.js");
const {
	SOCIAL_MESSAGE_TYPES,
	SOCIAL_RESPONSE_TYPES
} = require("./protocol/SocialProtocolNames.js");
const {
	WORLD_MESSAGE_TYPES,
	WORLD_RESPONSE_TYPES
} = require("./protocol/WorldProtocolNames.js");

const APPLICATION_ID = "shema-strike";
const APPLICATION_VERSION = 1;

module.exports = {
	APPLICATION_ID,
	APPLICATION_VERSION,
	EVENT_TYPES,
	MESSAGE_TYPES,
	RESPONSE_TYPES,
	SOCIAL_MESSAGE_TYPES,
	SOCIAL_RESPONSE_TYPES,
	WORLD_MESSAGE_TYPES,
	WORLD_RESPONSE_TYPES
};
