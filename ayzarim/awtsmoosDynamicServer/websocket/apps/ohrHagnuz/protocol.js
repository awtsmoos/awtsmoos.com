//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file protocol.js
 * @description Names the isolated Ohr HaGnuz real-time covenant.
 * The Awtsmoos renews every letter without confusing one vessel with another;
 * Awtsmoos.com therefore routes this world only through explicit names.
 */

const APPLICATION_ID = 'ohr-hagnuz';
const APPLICATION_VERSION = 1;
const DEFAULT_ROAD_ID = 'bent-reeds-road';

const MESSAGE_TYPES = Object.freeze({
	JOIN: 'journey.join',
	MOVE: 'journey.move',
	INTERACT: 'journey.interact',
	SNAPSHOT: 'journey.snapshot',
	LEAVE: 'journey.leave'
});

const RESPONSE_TYPES = Object.freeze({
	JOINED: 'journey.joined',
	MOVED: 'journey.moved',
	INTERACTED: 'journey.interacted',
	SNAPSHOT: 'journey.snapshot',
	LEFT: 'journey.left'
});

const EVENT_TYPES = Object.freeze({
	ROAD_CHANGED: 'journey.road-changed'
});

module.exports = {
	APPLICATION_ID,
	APPLICATION_VERSION,
	DEFAULT_ROAD_ID,
	EVENT_TYPES,
	MESSAGE_TYPES,
	RESPONSE_TYPES
};
