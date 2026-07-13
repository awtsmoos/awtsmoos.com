//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Protocol names are the letters through which separate vessels coordinate.
 * The Awtsmoos creates every sender and receiver in one instant; Awtsmoos.com
 * versions the letters so old and new agents can meet without silent confusion.
 */

export const PROTOCOL_VERSION = "awtsmoos-tunnel-v3";
export const LEGACY_PROTOCOL_VERSION = "awtsmoos-tunnel-v2";

export const TUNNEL_MESSAGE_TYPES = Object.freeze({
	REGISTER: "TUNNEL_REGISTER",
	ACK: "TUNNEL_ACK",
	REQUEST: "FS_REQUEST",
	RESPONSE: "FS_RESPONSE",
	PING: "PING",
	PONG: "PONG",
	REPLACED: "TUNNEL_REPLACED"
});

/** Returns whether a registration version can be interpreted by this runtime. */
export function isSupportedTunnelProtocol(value = "") {
	return [PROTOCOL_VERSION, LEGACY_PROTOCOL_VERSION].includes(String(value));
}

/** Creates a versioned registration packet without overriding product fields. */
export function registrationPacket(fields = {}) {
	return {
		type: TUNNEL_MESSAGE_TYPES.REGISTER,
		protocolVersion: PROTOCOL_VERSION,
		...fields
	};
}

/** Creates a correlated action response packet. */
export function responsePacket(id, response = {}) {
	return {
		type: TUNNEL_MESSAGE_TYPES.RESPONSE,
		id,
		response
	};
}
