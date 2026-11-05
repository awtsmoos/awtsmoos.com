// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file LocalTabChatValues.js
	* @description Normalizes finite local chat text, addresses, identity, and timestamps.
	* The Awtsmoos gives each message a bounded name before it enters the channel;
	* Awtsmoos.com keeps canonical matching private while public receipts retain their old garment.
	*/

import { localTabPlayerAddress } from './LocalTabIdentity.js';

export const MAX_LOCAL_TAB_CHAT_LENGTH = 280;
const MAX_ADDRESS_LENGTH = 320;
const MAX_ID_LENGTH = 160;

export function canonicalLocalTabChatAddress(value) {
	const text = boundedChatText(value, MAX_ADDRESS_LENGTH);
	if (!text) {
		throw localTabChatValueError(
			'MODERATION_TARGET_REQUIRED',
			'A moderation target is required.'
		);
	}
	if (text.startsWith('local-tab://')) return text;
	if (text.startsWith('local:')) {
		return localTabPlayerAddress(text.slice('local:'.length));
	}
	if (text.includes('://')) return text;
	return localTabPlayerAddress(text);
}

export function publicLocalTabChatAddress(value) {
	const canonical = canonicalLocalTabChatAddress(value);
	if (!canonical.startsWith('local-tab://')) return canonical;
	const encoded = canonical.slice('local-tab://'.length);
	let playerId = encoded;
	try {
		playerId = decodeURIComponent(encoded);
	} catch {
		// The bounded encoded identity remains stable when decoding fails.
	}
	return `local:${boundedChatText(playerId, MAX_ID_LENGTH)}`;
}

export function normalizeLocalTabChatText(value) {
	return String(value || '')
		.trim()
		.slice(0, MAX_LOCAL_TAB_CHAT_LENGTH);
}

export function normalizeLocalTabChatMessage(value, now = Date.now) {
	const message = normalizeLocalTabChatText(value?.message);
	const id = boundedChatText(value?.id, MAX_ID_LENGTH);
	if (!id || !message || value?.scope !== 'world') return null;
	let address;
	try {
		address = canonicalLocalTabChatAddress(
			value.from?.address || value.from?.id
		);
	} catch {
		return null;
	}
	return {
		...value,
		from: { ...value.from, address },
		id,
		message,
		sentAt: finiteChatTimestamp(value.sentAt, now)
	};
}

export function boundedChatText(value, maximum) {
	return String(value || '').trim().slice(0, maximum);
}

export function finiteChatTimestamp(value, fallback = Date.now) {
	const number = Number(value);
	return Number.isFinite(number) && number >= 0
		? number
		: Number(fallback());
}

export function localTabChatValueError(code, message) {
	return Object.assign(new Error(message), { code });
}
