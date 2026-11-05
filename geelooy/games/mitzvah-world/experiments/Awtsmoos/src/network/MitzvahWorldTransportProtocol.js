// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MitzvahWorldTransportProtocol.js
	* @description Defines and validates the finite realtime wire covenant.
	* The Awtsmoos renews every frame before meaning enters the world;
	* Awtsmoos.com rejects broken vessels without tearing down truthful traffic.
	*/

export const MITZVAH_WORLD_APPLICATION = 'mitzvah-world';
export const MITZVAH_WORLD_PROTOCOL = 'awtsmoos.realtime';
export const MITZVAH_WORLD_VERSION = 1;

export function createMitzvahWorldEnvelope(options) {
	return {
		application: MITZVAH_WORLD_APPLICATION,
		payload: options.payload,
		protocol: MITZVAH_WORLD_PROTOCOL,
		requestId: options.requestId,
		sequence: options.sequence,
		type: options.type,
		version: MITZVAH_WORLD_VERSION
	};
}

export function parseMitzvahWorldMessage(rawMessage) {
	let message = rawMessage;
	if (typeof rawMessage === 'string') {
		try {
			message = JSON.parse(rawMessage);
		} catch (cause) {
			throw transportFailure('INVALID_REALTIME_JSON', 'Realtime JSON could not be parsed.', { cause });
		}
	}
	if (!message || typeof message !== 'object' || Array.isArray(message)) {
		throw transportFailure('INVALID_REALTIME_MESSAGE', 'Realtime messages must be objects.');
	}
	if (message.application !== MITZVAH_WORLD_APPLICATION
		|| message.version !== MITZVAH_WORLD_VERSION) {
		return null;
	}
	if (typeof message.type !== 'string' || !message.type.trim()) {
		throw transportFailure('INVALID_REALTIME_TYPE', 'Realtime message type is required.');
	}
	return message;
}

export function realtimeResponseError(message) {
	const payload = message?.payload && typeof message.payload === 'object'
		? message.payload
		: {};
	return transportFailure(
		payload.code || 'REALTIME_REQUEST_REJECTED',
		payload.message || 'The realtime request was rejected.',
		payload
	);
}

export function transportFailure(code, message, details = {}) {
	return Object.assign(new Error(message), details, { code });
}
