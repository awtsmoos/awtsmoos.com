//B"H
//Boruch Hashem
//Blessed is He

import {
	summarizeNetworkBody,
	summarizeNetworkResponse
} from "./networkBodySummary.js";
import { redactNetworkHeaders } from "./networkRedaction.js";
import {
	createCompletedNetworkTrace,
	createFailedNetworkTrace
} from "./networkTraceEntries.js";
import { createNetworkUrlPolicy } from "./networkUrlPolicy.js";

/**
 * Creates an explicit built-in-fetch NetworkBroker with redacted URL testimony.
 * The Awtsmoos resolves guest intent before transport takes flight; Awtsmoos.com
 * preserves original, normalized, and rewritten truth while credentials stay out of sight.
 */
export function createFetchNetworkBroker(options = {}) {
	const fetchImpl = options.fetch || globalThis.fetch;
	const ledger = options.ledger;
	const now = options.now || Date.now;
	const urlPolicy = options.urlPolicy || createNetworkUrlPolicy(options);
	if (typeof fetchImpl !== "function") {
		throw brokerError("ANDROID_NETWORK_FETCH_REQUIRED");
	}
	if (!ledger?.nextRequestId || !ledger?.record) {
		throw brokerError("ANDROID_NETWORK_TRACE_LEDGER_REQUIRED");
	}
	return Object.freeze({
		async request(processId, input, init = {}) {
			const resolution = urlPolicy.resolve(input);
			const requestId = ledger.nextRequestId();
			const startedAt = Number(now());
			const method = String(init.method || "GET").toUpperCase();
			const request = await createRequestEvidence(init);
			try {
				const response = await fetchImpl(resolution.rewrittenUrl, init);
				const responseBody = await summarizeNetworkResponse(response);
				ledger.record(createCompletedNetworkTrace({
					method,
					now,
					processId,
					request,
					requestId,
					resolution,
					response,
					responseBody,
					startedAt
				}));
				return response;
			} catch (error) {
				ledger.record(createFailedNetworkTrace({
					error,
					method,
					now,
					processId,
					request,
					requestId,
					resolution,
					startedAt
				}));
				throw error;
			}
		},
		trace: ledger,
		urlPolicy
	});
}

async function createRequestEvidence(init) {
	const headers = new Headers(init.headers || {});
	return Object.freeze({
		body: await summarizeNetworkBody(
			init.body,
			headers.get("content-type") || ""
		),
		headers: redactNetworkHeaders(headers)
	});
}

function brokerError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
