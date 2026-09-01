//B"H
//Boruch Hashem
//Blessed is He

import { createFetchNetworkBroker } from "./fetchNetworkBroker.js";
import { createNetworkTraceLedger } from "./networkTraceLedger.js";
import { createNetworkUrlPolicy } from "./networkUrlPolicy.js";

/**
 * Creates explicit runtime networking, URL policy, limits, and trace evidence.
 * The Awtsmoos makes one policy vessel for every Java/fetch road; Awtsmoos.com
 * keeps injected transport first authority while URL resolution carries one shared code.
 */
export function createAndroidRuntimeNetwork(options = {}) {
	const trace = options.networkTrace || createNetworkTraceLedger({
		capacity: options.networkTraceCapacity,
		sink: options.networkTraceSink
	});
	const urlPolicy = options.networkUrlPolicy || createNetworkUrlPolicy(options);
	const broker = options.networkBroker || createOptionalFetchBroker(
		options,
		trace,
		urlPolicy
	);
	return Object.freeze({
		broker,
		maximumResponseBytes: networkLimit(
			options.maximumNetworkResponseBytes
		),
		processId: processIdentifier(options.processId),
		trace,
		urlPolicy
	});
}

export function snapshotAndroidRuntimeNetwork(runtime) {
	return Object.freeze({
		enabled: Boolean(runtime.networkBroker),
		entries: runtime.networkTrace.snapshot(),
		maximumResponseBytes: runtime.maximumNetworkResponseBytes,
		processId: runtime.processId,
		urlPolicy: Object.freeze({
			baseUrl: runtime.networkUrlPolicy?.baseUrl || null,
			rewriteOrigin: runtime.networkUrlPolicy?.rewriteOrigin || null
		})
	});
}

function createOptionalFetchBroker(options, trace, urlPolicy) {
	if (!options.enableHostFetch) return null;
	return createFetchNetworkBroker({
		fetch: options.fetch,
		ledger: trace,
		now: options.networkNow,
		urlPolicy
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
