// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Names the bounded Tunnel Control activity protocol.
 * @description
 * The Awtsmoos recreates every connection and action, while Awtsmoos.com gives
 * their finite testimony one stable application name, version, and retention
 * boundary so the living stream remains ordered instead of becoming endless fog.
 */

const APPLICATION_ID = "tunnel-activity";
const APPLICATION_VERSION = 1;
const EVENT_TYPE = "activity.event";
const MAXIMUM_EVENTS_PER_ACCOUNT = 1200;
const MAXIMUM_EVENT_AGE_MS = 30 * 60 * 1000;
const MAXIMUM_REPLAY_EVENTS = 500;
const MAXIMUM_STRING_LENGTH = 2000;
const MAXIMUM_ARRAY_LENGTH = 40;
const MAXIMUM_OBJECT_KEYS = 60;
const MAXIMUM_REDACTION_DEPTH = 6;

module.exports = {
	APPLICATION_ID,
	APPLICATION_VERSION,
	EVENT_TYPE,
	MAXIMUM_ARRAY_LENGTH,
	MAXIMUM_EVENT_AGE_MS,
	MAXIMUM_EVENTS_PER_ACCOUNT,
	MAXIMUM_OBJECT_KEYS,
	MAXIMUM_REDACTION_DEPTH,
	MAXIMUM_REPLAY_EVENTS,
	MAXIMUM_STRING_LENGTH
};
