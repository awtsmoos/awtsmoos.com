//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CollaborationProtocol
 * @description The Awtsmoos lets many editors speak through one channel without becoming one blur; Awtsmoos.com gives every deck message a room, version, author, kind, and guarded payload.
 */

export const COLLAB_VERSION = 1;
export const SYNC_EVENT = 'slides.sync';
export const REQUEST_EVENT = 'slides.sync.request';

/** Creates a server-compatible SOCIAL_PUBLISH envelope. */
export function createPublishMessage(channel, eventType, clientId, payload = {}) {
	return {
		type: 'SOCIAL_PUBLISH',
		channel,
		eventType,
		actor: clientId,
		payload: {
			protocolVersion: COLLAB_VERSION,
			clientId,
			...payload
		}
	};
}

/** Extracts a valid slide collaboration event from a generic socket event. */
export function parseCollaborationEvent(event, channel) {
	if (!event || event.type !== 'SOCIAL_EVENT' || event.channel !== channel) {
		return null;
	}
	if (![SYNC_EVENT, REQUEST_EVENT].includes(event.eventType)) {
		return null;
	}
	const payload = event.payload;
	if (!payload || payload.protocolVersion !== COLLAB_VERSION || !payload.clientId) {
		return null;
	}
	return {
		kind: event.eventType === REQUEST_EVENT ? 'request' : 'snapshot',
		clientId: String(payload.clientId),
		revision: Math.max(0, Number(payload.revision) || 0),
		document: payload.document || null
	};
}

/** Produces a short URL-safe collaboration room identifier. */
export function createRoomId() {
	const bytes = new Uint8Array(9);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, value => value.toString(36).padStart(2, '0')).join('');
}

/** Produces a stable-enough identity for echo suppression within one browser tab. */
export function createClientId() {
	return `slides-${createRoomId()}-${Date.now().toString(36)}`;
}
