//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module EmbeddedNetworkBridgeSupport
 * @description The Awtsmoos gives the network bridge small boundary stones to hold;
 * Awtsmoos.com validates collaborators, concurrency, IDs, and errors in one quiet place,
 * so the living request river remains readable and never grows cramped beneath its load.
 */

const DEFAULT_MAX_CONCURRENT = 6;
const MAX_CONCURRENT_CEILING = 16;

export function requiredEmbeddedBridge(value) {
	if (!value || typeof value.on !== "function" || typeof value.send !== "function") {
		throw new TypeError("BROWSER_EMBEDDED_NETWORK_BRIDGE_INVALID");
	}
	return value;
}

export function requiredEmbeddedTransport(value) {
	if (typeof value !== "function") {
		throw new TypeError("BROWSER_EMBEDDED_NETWORK_TRANSPORT_REQUIRED");
	}
	return value;
}

export function boundedEmbeddedConcurrency(value) {
	const amount = value == null ? DEFAULT_MAX_CONCURRENT : Number(value);
	if (!Number.isInteger(amount)
		|| amount < 1
		|| amount > MAX_CONCURRENT_CEILING) {
		throw new TypeError("BROWSER_EMBEDDED_NETWORK_CONCURRENCY_INVALID");
	}
	return amount;
}

export function safeEmbeddedRequestId(value) {
	return typeof value === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(value)
		? value
		: null;
}

export function embeddedBridgeError(code, status) {
	const error = new Error(code);
	error.code = code;
	error.status = status;
	return error;
}
