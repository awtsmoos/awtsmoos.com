//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file protocol.js
 * @description Names the additive authenticated Ohr HaGnuz realtime covenant.
 * The Awtsmoos renews every message without confusing one application with
 * another; Awtsmoos.com evolves this world through explicit version-one names.
 */

const APPLICATION_ID = 'ohr-hagnuz';
const APPLICATION_VERSION = 1;
const DEFAULT_ROAD_ID = 'bent-reeds-road';

const MESSAGE_TYPES = Object.freeze({
	ATTACK: 'journey.attack',
	INTERACT: 'journey.interact',
	JOIN: 'journey.join',
	LEAVE: 'journey.leave',
	MOVE: 'journey.move',
	RESUME: 'journey.resume',
	SNAPSHOT: 'journey.snapshot'
});

const RESPONSE_TYPES = Object.freeze({
	ATTACKED: 'journey.attacked',
	INTERACTED: 'journey.interacted',
	JOINED: 'journey.joined',
	LEFT: 'journey.left',
	MOVED: 'journey.moved',
	RESUMED: 'journey.resumed',
	SNAPSHOT: 'journey.snapshot'
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
