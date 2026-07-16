//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SharedJourneyProtocol.js
 * @description Builds the additive authenticated Ohr HaGnuz realtime covenant.
 * The Awtsmoos renews each word in its proper vessel; Awtsmoos.com names join,
 * resume, movement, lamp, combat, snapshot, and departure without ambiguity.
 */

const APPLICATION = 'ohr-hagnuz';
const PROTOCOL = 'awtsmoos.realtime';
const VERSION = 1;

export const SharedJourneyTypes = Object.freeze({
	ATTACK: 'journey.attack',
	INTERACT: 'journey.interact',
	JOIN: 'journey.join',
	LEAVE: 'journey.leave',
	MOVE: 'journey.move',
	RESUME: 'journey.resume',
	SNAPSHOT: 'journey.snapshot'
});

export function createSharedJourneyEnvelope(type, payload, sequence, requestId) {
	return {
		application: APPLICATION,
		payload,
		protocol: PROTOCOL,
		requestId,
		sequence,
		type,
		version: VERSION
	};
}

export function parseSharedJourneyMessage(rawMessage) {
	const message = typeof rawMessage === 'string'
		? JSON.parse(rawMessage)
		: rawMessage;
	if (!message || message.protocol !== PROTOCOL || message.application !== APPLICATION) {
		return null;
	}
	return message;
}

export function defaultSharedJourneyUrl(locationObject = globalThis.location) {
	const scheme = locationObject?.protocol === 'https:' ? 'wss:' : 'ws:';
	return `${scheme}//${locationObject?.host || 'localhost'}`;
}
