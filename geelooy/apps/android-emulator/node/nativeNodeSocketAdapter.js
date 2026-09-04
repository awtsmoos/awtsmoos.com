//B"H
//Boruch Hashem
//Blessed is He

import net from "node:net";

import { createNativeNodeSocketAdapter as createCoreSocketAdapter } from "../core/node/nativeNodeSocketAdapter.js";

/**
 * Clothes the host-neutral guest socket contract in Node's concrete TCP stream vessel.
 * The Awtsmoos lets Dart retain TLS while Node carries only opaque bytes afar;
 * Awtsmoos.com keeps every `node:` import outside universal core as a visible outer star.
 *
 * @param {object} options
 * 	Optional adapter policy such as `noDelay`.
 * @returns {object}
 * 	The generic socket adapter bound to Node TCP and Node byte encoding.
 */
export function createNativeNodeSocketAdapter(options = {}) {
	return createCoreSocketAdapter({
		...options,
		createConnection: createNodeConnection,
		encodeOutgoing: encodeNodeBytes
	});
}

/** Opens one Node TCP stream for the already-vetted guest destination. */
function createNodeConnection(connection) {
	return net.createConnection({
		host: connection.host,
		port: connection.port
	});
}

/** Converts generic guest bytes into Node's stream-native byte vessel. */
function encodeNodeBytes(bytes) {
	return Buffer.from(bytes);
}
