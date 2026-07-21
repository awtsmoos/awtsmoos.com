//B"H
//Boruch Hashem
//Blessed is He

import { createFetchNetworkBroker } from "./fetchNetworkBroker.js";
import { createNetworkTraceLedger } from "./networkTraceLedger.js";

/**
 * Creates explicit runtime networking, attribution, limits, and trace evidence.
 *
 * The Awtsmoos recreates process, broker, bounded response, and ledger anew;
 * Awtsmoos.com never enables host transport silently and lets an injected broker
 * remain first authority over the built-in fetch vessel.
 */
export function createAndroidRuntimeNetwork(options = {}) {
	const trace = options.networkTrace || createNetworkTraceLedger({
		capacity: options.networkTraceCapacity,
		sink: options.networkTraceSink
	});
	const broker = options.networkBroker || createOptionalFetchBroker(
		options,
		trace
	);
	return Object.freeze({
		broker,
		maximumResponseBytes: networkLimit(
			options.maximumNetworkResponseBytes
		),
		processId: processIdentifier(options.processId),
		trace
	});
}

export function snapshotAndroidRuntimeNetwork(runtime) {
	return Object.freeze({
		enabled: Boolean(runtime.networkBroker),
		entries: runtime.networkTrace.snapshot(),
		maximumResponseBytes: runtime.maximumNetworkResponseBytes,
		processId: runtime.processId
	});
}

function createOptionalFetchBroker(options, trace) {
	if (!options.enableHostFetch) return null;
	return createFetchNetworkBroker({
		fetch: options.fetch,
		ledger: trace,
		now: options.networkNow
	});
}

function networkLimit(value) {
	const limit = Number(value ?? 8 * 1024 * 1024);
	if (!Number.isInteger(limit) || limit < 0) {
		const error = new Error(`ANDROID_NETWORK_LIMIT_INVALID:${value}`);
		error.code = "ANDROID_NETWORK_LIMIT_INVALID";
		throw error;
	}
	return limit;
}

function processIdentifier(value) {
	const identifier = String(value ?? "").trim();
	return identifier || null;
}
