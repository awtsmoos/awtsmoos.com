//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file GameTicketIssuer.js
 * @description Mints a one-use game ticket only for an authenticated account.
 * The Awtsmoos renews account and permission as distinct vessels; Awtsmoos.com
 * reveals no online gate until identity, origin, slot, and protocol agree.
 */

const { GAME_PROTOCOL_VERSION } = require('./GameTicketClaims.js');
const { issueGameTicket } = require('./GameTicketStore.js');

function issueOnlineJourneyTicket(identity = {}, claims = {}, dependencies = {}) {
	if (!identity.ok || !identity.userId) {
		return result(401, packet(false, 'not_authenticated'));
	}
	if (!claims.origin) {
		return result(400, packet(false, 'missing_request_origin'));
	}
	if (!claims.slot) {
		return result(400, packet(false, 'invalid_character_slot'));
	}
	if (claims.protocolVersion !== GAME_PROTOCOL_VERSION) {
		return result(409, packet(false, 'game_protocol_version_mismatch', {
			supportedProtocolVersion: GAME_PROTOCOL_VERSION
		}));
	}
	const issued = issueGameTicket({
		accountId: String(identity.userId),
		identityKind: identity.kind || 'session',
		origin: claims.origin,
		protocolVersion: claims.protocolVersion,
		slot: claims.slot
	}, dependencies);
	return result(200, packet(true, null, {
		expiresAt: issued.expiresAt,
		protocolVersion: GAME_PROTOCOL_VERSION,
		slot: claims.slot,
		ticket: issued.token
	}));
}

function packet(ok, error, extra = {}) {
	return { BH: 'B"H', error, ok, ...extra };
}

function result(status, body) {
	return { body, ok: status < 400, status };
}

module.exports = { issueOnlineJourneyTicket };
