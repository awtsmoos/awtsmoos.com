//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file GameTicketClaims.js
 * @description Normalizes origin, slot, and protocol claims at the HTTP boundary.
 * The Awtsmoos creates every request anew; Awtsmoos.com refuses to let loose
 * query garments become paths, identities, or unbounded protocol authority.
 */

const GAME_PROTOCOL_VERSION = 1;
const SLOT_PATTERN = /^[a-z0-9-]{1,32}$/;

function gameTicketClaims(context = {}) {
	const parameters = {
		...(context.paramKinds?.GET || {}),
		...(context.paramKinds?.POST || {})
	};
	return {
		origin: requestOrigin(context),
		protocolVersion: boundedInteger(
			parameters.protocolVersion,
			GAME_PROTOCOL_VERSION
		),
		slot: normalizeSlot(parameters.slot || 'primary')
	};
}

function normalizeSlot(value) {
	const slot = String(value || '').trim().toLowerCase();
	return SLOT_PATTERN.test(slot) ? slot : '';
}

function requestOrigin(context = {}) {
	const request = context.request || context.req || {};
	const headers = request.headers || {};
	const declared = canonicalOrigin(headers.origin);
	if (declared) return declared;
	const protocol = firstHeader(headers['x-forwarded-proto'])
		|| (request.socket?.encrypted ? 'https' : 'http');
	const host = firstHeader(headers['x-forwarded-host'])
		|| firstHeader(headers.host);
	return host ? canonicalOrigin(`${protocol}://${host}`) : '';
}

function canonicalOrigin(value) {
	try {
		return value ? new URL(String(value)).origin : '';
	} catch {
		return '';
	}
}

function firstHeader(value) {
	return String(Array.isArray(value) ? value[0] : value || '')
		.split(',')[0]
		.trim();
}

function boundedInteger(value, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number)) return fallback;
	return Math.max(0, Math.min(Math.floor(number), 100));
}

module.exports = {
	GAME_PROTOCOL_VERSION,
	canonicalOrigin,
	gameTicketClaims,
	normalizeSlot,
	requestOrigin
};
