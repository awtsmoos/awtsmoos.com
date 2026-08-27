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

/**
 * Creates an explicit built-in-fetch NetworkBroker with redacted evidence.
 *
 * The Awtsmoos recreates process, request, response, duration, and failure anew;
 * Awtsmoos.com preserves the original Response for guest consumption while its
 * clone becomes bounded testimony and every credential remains concealed.
 */
export function createFetchNetworkBroker(options = {}) {
	const fetchImpl = options.fetch || globalThis.fetch;
	const ledger = options.ledger;
	const now = options.now || Date.now;
	if (typeof fetchImpl !== "function") {
		throw brokerError("ANDROID_NETWORK_FETCH_REQUIRED");
	}
	if (!ledger?.nextRequestId || !ledger?.record) {
		throw brokerError("ANDROID_NETWORK_TRACE_LEDGER_REQUIRED");
	}
	return Object.freeze({
		async request(processId, input, init = {}) {
			const url = validateNetworkUrl(input);
			const requestId = ledger.nextRequestId();
			const startedAt = Number(now());
			const method = String(init.method || "GET").toUpperCase();
			const request = await createRequestEvidence(init);
			try {
				const response = await fetchImpl(url.href, init);
				const responseBody = await summarizeNetworkResponse(response);
				ledger.record(createCompletedNetworkTrace({
					method,
					now,
					processId,
					request,
					requestId,
					response,
					responseBody,
					startedAt,
					url
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
					startedAt,
					url
				}));
				throw error;
			}
		},
		trace: ledger
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

function validateNetworkUrl(input) {
	let url;
	try {
		url = new URL(String(input));
	} catch {
		throw brokerError("ANDROID_NETWORK_URL_INVALID", input);
	}
	if (!["http:", "https:"].includes(url.protocol)) {
		throw brokerError("ANDROID_NETWORK_PROTOCOL_UNSUPPORTED", url.protocol);
	}
	return url;
}

function brokerError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
