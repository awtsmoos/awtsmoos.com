//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PresenceProtocol
 * @description
 * The Awtsmoos lets ephemeral room-language and transport addressing remain exact while durable truth stays elsewhere;
 * Awtsmoos.com gives socket URLs and every LOGIN, ENTER, LEAVE, TYPING, and READING message one canonical vessel.
 */

export function presenceSocketUrl(locationLike = location) {
	const protocol = locationLike.protocol === 'https:' ? 'wss' : 'ws';
	return `${protocol}://${locationLike.host}`;
}

export function parsePresenceMessage(data) {
	try {
		return JSON.parse(data);
	} catch {
		return {
			type: 'PAGE_TEXT',
			text: String(data)
		};
	}
}

export function loginMessage(aliasId) {
	return {
		type: 'LOGIN',
		aliasId
	};
}

export function pageEnterMessage(aliasId, channel, status = 'viewing') {
	return {
		type: 'PAGE_ENTER',
		aliasId,
		channel,
		status
	};
}

export function pageLeaveMessage(aliasId, channel) {
	return {
		type: 'PAGE_LEAVE',
		aliasId,
		channel
	};
}

export function pageTypingMessage(aliasId, channel, typing = true) {
	return {
		type: 'PAGE_TYPING',
		aliasId,
		channel,
		typing
	};
}

export function pageReadingMessage(aliasId, channel, reading) {
	return {
		type: 'PAGE_READING',
		aliasId,
		channel,
		reading
	};
}

export function reconnectDelay(attempt = 0, random = Math.random) {
	const exponent = Math.min(Math.max(Number(attempt) || 0, 0), 6);
	const base = Math.min(400 * (2 ** exponent), 12000);
	const sample = Math.min(Math.max(Number(random()) || 0, 0), 1);
	const jitter = 0.75 + (sample * 0.5);
	return Math.round(Math.min(base * jitter, 12000));
}
